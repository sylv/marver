use anyhow::anyhow;
use futures_util::stream::StreamExt;
use reqwest::header::{HeaderValue, RANGE};
use reqwest::Client;
use std::fs;
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::PathBuf;
use zip::ZipArchive;

use std::fs::File;
use std::io::BufReader;

async fn check_hash(path: &PathBuf, md5sum: &str) -> Result<bool, anyhow::Error> {
    println!("Validating MD5 hash of {}", path.display());
    let f = File::open(path)?;
    let len = f.metadata()?.len();
    let buf_len = len.min(1_000_000) as usize;
    let mut buf = BufReader::with_capacity(buf_len, f);
    let mut context = md5::Context::new();
    let mut buffer = vec![0; buf_len];
    while let Ok(n) = buf.read(&mut buffer) {
        if n == 0 {
            break;
        }
        context.consume(&buffer[..n]);
    }
    let digest = context.compute();
    Ok(format!("{:x}", digest) == md5sum)
}

/// Ensure a file exists on disk:
/// - if it does not, download it to the given path and validate its checksum.
/// - if it does, do nothing.
pub async fn ensure_file(url: &str, path: &PathBuf, md5sum: Option<&str>) -> anyhow::Result<()> {
    // If path exists on disk, check md5sum, if matches return
    if path.exists() {
        if let Some(md5sum) = md5sum {
            if !check_hash(path, md5sum).await? {
                return Err(anyhow!("MD5 mismatch on {}", path.display()));
            }
        }

        println!("File {} already exists, skipping download", path.display());
        return Ok(());
    }

    let mut tmp_path = path.clone().into_os_string();
    tmp_path.push(".filepart");
    let tmp_path: PathBuf = tmp_path.into();

    // Create or open a file
    fs::create_dir_all(path.parent().unwrap())?;
    let mut file = fs::OpenOptions::new()
        .write(true)
        .create(true)
        .open(&tmp_path)?;

    let client = Client::new();

    // try resume partial download
    let downloaded = file.metadata()?.len();
    if downloaded != 0 {
        file.seek(SeekFrom::Start(downloaded))?;
        println!(
            "Resuming download of {} from {} bytes",
            path.display(),
            downloaded
        );
    }

    let range = format!("bytes={}-", downloaded);
    let response = client
        .get(url)
        .header(RANGE, HeaderValue::from_str(&range)?)
        .send()
        .await?;

    let status = response.status().as_u16();
    if status == 416 {
        println!(
            "File {} already fully downloaded, skipping download",
            path.display()
        );
    } else if status != 206 && status != 200 {
        return Err(anyhow!("Invalid server response {} on {}", status, url));
    } else {
        let size = response
            .headers()
            .get("content-length")
            .unwrap()
            .to_str()
            .unwrap()
            .parse::<u64>()
            .unwrap()
            + downloaded;

        let mut stream = response.bytes_stream();
        let mut check = 0;
        while let Some(item) = stream.next().await {
            let chunk = item?;
            file.write_all(&chunk)?;
            check += 1;
            if check % 100 == 0 {
                let len = file.metadata()?.len();
                println!("Downloaded {}/{} ({}%) bytes", len, size, len * 100 / size);
            }
        }

        if file.metadata()?.len() != size {
            return Err(anyhow!("Downloaded file size mismatch"));
        }
    }

    if let Some(md5sum) = md5sum {
        if !check_hash(&tmp_path, md5sum).await? {
            return Err(anyhow!("MD5 mismatch on {}", path.display()));
        }
    }

    // Rename tmp file to target path
    fs::rename(tmp_path, path)?;
    Ok(())
}

/// Ensure a zip file exists on disk and is unzipped in the given directory.
/// Returns a list of unzipped files.
/// `file_filter` can be used to filter which files are unzipped if only a subset is needed.
pub async fn ensure_zip(
    url: &str,
    dir: &PathBuf,
    md5sum: Option<&str>,
    file_filter: fn(&PathBuf) -> bool,
) -> anyhow::Result<Vec<PathBuf>> {
    // If path exists on disk, check md5sum, if matches return
    if dir.exists() {
        // ensure the directory has all files in file_filter
        let files = fs::read_dir(dir)?
            .filter_map(|f| f.ok())
            .map(|f| f.path())
            .collect::<Vec<_>>();

        println!(
            "Directory {} already exists, skipping download",
            dir.display()
        );
        return Ok(files);
    }

    let mut tmp_path = dir.clone().into_os_string();
    tmp_path.push(".zippart");
    let tmp_path: PathBuf = tmp_path.into();
    ensure_file(url, &tmp_path, md5sum).await?;

    // unzip
    println!("Unzipping {} to {}", tmp_path.display(), dir.display());
    let file = File::open(&tmp_path)?;
    let mut archive = ZipArchive::new(file)?;
    fs::create_dir_all(dir)?;

    let mut files = vec![];
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;

        let mut path = dir.clone();
        path.push(file.name());

        let keep = file_filter(&path);
        if !keep {
            continue;
        }

        let mut outfile = fs::File::create(&path)?;
        std::io::copy(&mut file, &mut outfile)?;

        files.push(path);
    }

    // delete temp file
    fs::remove_file(&tmp_path)?;

    Ok(files)
}

pub fn get_models_dir() -> PathBuf {
    // todo: this should be configurable, especially in docker
    let mut path = dirs::home_dir().unwrap();
    path.push(".rehoboam");
    path.push("models");
    path
}
