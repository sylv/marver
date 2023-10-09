use anyhow::anyhow;
use futures_util::stream::StreamExt;
use reqwest::header::{HeaderValue, RANGE};
use reqwest::Client;
use std::fs;
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::PathBuf;

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

pub async fn ensure_file(
    url: &str,
    path: &PathBuf,
    md5sum: Option<&str>,
) -> Result<(), anyhow::Error> {
    // If path exists on disk, check md5sum, if matches return
    if path.exists() {
        println!("File {} already exists, skipping download", path.display());
        return Ok(());
    }

    let mut tmp_path = path.clone().into_os_string();
    tmp_path.push(".filepart");
    let tmp_path: PathBuf = tmp_path.into();

    // Create or open a file
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
    } else if status != 206 {
        return Err(anyhow!("Invalid server response"));
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
