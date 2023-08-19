<p align="center">
  <img src="./assets/logo-large.png" height="128" width="128" />
</p>

# marver

> **Warning**
> marver is not ready, a lot is unimplemented and it might not even run. DO NOT USE MARVER IN PRODUCTION (yet)! If you give it access to your family photos and it deletes them or edits your grandparents to have funny clown hats, that's on you.

> **Note**
> This is what is _intended_. See the feature list and ideas sections for a more accurate representation.

marver takes your messy, unorganised media and turns it into your personal streaming service, photo viewer and media library.

marver will index your media and make it as user-friendly as possible. Point marver at your nas and it will extract information as best it can based on the file name, file contents, supporting files (subtitles, json, etc) and whatever else it can get its grubby little hands on. marver will take all that information and make it searchable, filterable, and viewable. If it can't find enough metadata, you can help push it in the right direction - attach a YouTube ID, IMDb ID, etc to a file and it'll grab the view count, comments, plot, poster, etc and display it along side the file. It's like Plex but for more than just movies and tv shows, and with a stronger focus on extracting metadata. Have a load of family photos laying around on your NAS? Let marver index them and generate albums based on faces, locations, dates, etc.

## goals

- Privacy is important. Looking up metadata online is fine, as long as it is not revealing any information about you or your files.
- No uploads, use something else to handle that for now.
- No authentication/users for now. Setup a reverse proxy with basic auth instead. In the future user support will come.
- Metadata extraction must be great.
  - Other alternatives are generally bad at this, requiring a specific file structure and naming scheme for it to work.
  - File metadata can contain a significant amount of information.

## pieces

marver is comprised of multiple smaller pieces, but once it's ready for deployment all these will be shipped in a single docker image.

- [blahaj](./packages/blahaj/) - the frontend (typescript, react, vite, graphql)
- [sotast](./packages/sotast/) - the backend that does most of what you see (typescript, nestjs)
- [sentry](./packages/sentry/) - machine learning grpc microservice (python)
- [squtil](./packages/squtil/) - sqlite extension that provides vector search and other utilities (rust)
- [vidhash](./packages/vidhash/) - utilities for perceptual hashing of images and videos. (rust, ffmpeg. will give you nightmares.)

## features

- CLIP image and video search, "a pink sky at sunset" or "a picture of a dog wearing a clown costume"
- CLIP-based related images and videos with filters
- Transcoding unsupported videos on demand<sup>1</sup>
- Converting unsupported images on demand
- Blurred loading placeholders using [thumbhash](https://evanw.github.io/thumbhash/)
- EXIF extraction
- Subtitle extraction and cleanup, removing advertisements and other junk
- Skip intro and credits detection using perceptual hashes of frames<sup>2</sup>
- Face recognition<sup>2</sup>

<sup>1. with some video files, there are audio glitches that occur between segments. chrome supports h265 now and if the browser supports the video it'll play the original so this is less of an issue.</sup>

<sup>2. perceptual hashes for videos are generated, but detecting overlaps and the skip intro button is not in yet.</sup>

<sup>3. Faces are extracted and stored, but you cannot tie a name to a face yet. You can search for similar faces using `face:face_id` which will order by similarity. I'm not sure how to go about assigning a name to a face and matching other face matches to a name just yet.</sup>

### ideas

- Document support
  - Detect scanned receipts
  - Preview support for PDFs/other documents
  - Auto-detecting images of documents and treat them as documents
    - OCR should allow to convert images of documents to a PDF which is much more useful
- Query builder
  - Let users query their data using raw SQL.
  - An LLM can be used to generate queries based on the user's input, "show me all photos taken between 2010 and 2015, with Ryan in them" could query by exif metadata, and filter by photos with faces that match Ryan. Can just open a read-only sqlite connection so nothing can break.
  - Would be a nightmare to do permissions for, but admin-only would still be useful.
  - Would also be a nightmare to do UI for, displaying the results in the expected format. Maybe just let the LLM pick the appropriate view format - give it options like `generic`, `image_gallery`, `tv_shows`, `movies`, `documents` and each one displays the results in a different way.
- TV show intros/credits can be detected more efficiently by detecting them on one episode, then checking the rest of the episodes for the same timestamps. If the frames match +- 5 seconds, the timestamps can be reused.
- Moving or changing files slightly should copy over metadata if the files are mostly the same
  - Support either the file path changing but the contents being the same (same size+perceptual hash+maybe sha256 hash) _and_ the file extension changing but the contents remaining the same (same dimensions+perceptual hash) to allow for people organising their library _and_ transcoding files to a new format without losing metadata.
  - For images, the width+height should match, or the perceptual hash should match.
  - For videos, the duration, height+width or perceptual hash of most frames should match.
  - For other types, don't copy tags unless explicitly told to.
  - For all types, it should only happen if the old file was deleted _and_ the new file was added in the time since the last scan.
- An option to cache the transcode result of the first 15-30 seconds of every video
  - This would be excellent for slow remote mounts, we can start the stream quickly and hopefully we can start reading the real file before the cache runs out.
  - Filtering options would be good, so for example only videos over 10gb in the `media/movies` folder would be cached.
- Run OCR on images
  - Index the text and use that for search
  - [MMOCR](https://github.com/open-mmlab/mmocr) seems like the best option for this
  - Run translatelocally, libretranslate or even Vicuna-13b if we already have it to translate the text, and with Vicuna we can even use it to clean it up or provide context (especially if it can "see" the image with CLIP, but I doubt we're gonna get that advanced)
  - Overlay the text invisibly with the same bounding box on the image so you can copy/paste it.
- Batch ffmpeg segments into a single command. This should be faster and let ffmpeg go wild with the CPU/GPU.
  - It would make sense to only do this for segments later on, and keep the first few individual because getting them out the door as fast as possible is more important initially.
- Sync the video position to the server so it remembers where you stopped watching
  - Only do this on longer (>5m) videos and only after you've actually watched for a few minutes (skipping a few minutes in should not count).
  - Show half watched videos in a "continue watching" section
- Sync the video position to localStorage every second so accidentally closing a tab and reopening it will immediately pick up where you left off
- Mute videos if they contain tags like `bad_audio`, `corrupted_audio`, etc.
- Facial recognition
  - Ability to add names to faces
  - Find all images with a face by clicking on it
  - Searching for a name will bias towards images with that face
- Reverse image/video search. Upload an image and use the perceptual hashes to find similar images/videos.
  - This can work for videos using the stored perceptual hashes, you could even find videos based on a screenshot of them.
- Run [whisper](https://github.com/openai/whisper) on videos and generate SRT subtitles for them.
- Index subtitles for search
  - Clicking on a subtitle result will take you to that time in the video
  - We should index both generated and existing subtitles
- Automatically scan for gallery indexes in file names and generate collections from them, or just show them in a "related" panel.
  - For example, `[galleryIndex=1]` in file names. It would have to base it off some other identifier, like an id or clean file name.
  - Require all entries to be in the same folder
  - Limit the max per automatic collection to like 50 or something
  - Require all gallery indexes to be present. If there are only `0` and `2` in a folder, don't create a collection for it.
- Tags should be a graph.
  - An "apple pie" tag would be a child of the "food" tag. Searching for "food" also searches for "apple pie", as well as "burger" and other related tags.
- Extract tags in file names like `my photo #beach #dog`
- It's cliche but embedding an LLM would actually be fantastic, especially with fine tuning on a smaller (<3B) model.
  - Metadata extraction is hard, regex does not work. An LLM could be fine-tuned to extract metadata from file names.
  - Some files will have .json files with metadata, an LLM could be used to extract information without knowing what the structure of the json file is.
  - It can generate clean names for files, eg `my_photo_2019.jpg` -> `My Photo`
  - It could link together files based on the path. For example `my_photo_21.jpg` and `my_photo_22.jpg` should be in the same gallery/album, but that's not obvious from the file name without a human or LLM looking at both at the same time.
  - It would definitely be overkill, but it could simplify a lot of useful features.
  - [GPT-JSON](https://github.com/piercefreeman/gpt-json) would be a good way to generate JSON without wasting time generating the JSON structure.
  - It would have to be optional and ideally a few different model sizes so you can pick the one that fits best with your system. A fine-tuned 3B model might be enough but a 13B model would likely do significantly better, even if it uses 4x the memory. That's a tradeoff the user should be able to make.
  - It could be used to reorganise files on disk. If you have a load of files dumped into a folder, based on all the available metadata and a given file structure, it could determine where each file should go. This could be done "virtually", only shown in the interface, or by moving the actual files on disk which would be considerably riskier.
- Sort options (tag count, date scanned, date created, size, bitrate, title, type, duration, resolution, views, favourites, path, randomly, etc)
- Use `<img srcset />` and let the browser decide on the best image type, instead of guessing based on the `Accept` header.
- Storage breakdown somewhere. Show % of images, videos, other. Could be cool to also show a bar at the bottom of images/photos to show duplicates or very similar images. [MacOS storage breakdown](https://i.imgur.com/hoBR9zF.png) would be a good example.
  - A pie graph showing storage usage by type would also be cool
  - Being able to see the average size of each type would be very cool
  - Being able to see storage usage for a folder would be poggers
- Detect movie intros the same way as episode intros, and provide and option to skip them. We can do this by comparing movies to all the other movies and finding overlapping video in the first few minutes. We can also account for intros we haven't seen if we detect intros either side and assuming the stuff between them is another intro.
- Built in upscaling could be cool, definitely feature creep though.
- When deduplicating images, detect images with "upscale" and etc in the name and don't deduplicate them. We don't want to delete the original in favour of an upscaled result.
- Previews for STL/OBJ/3D files. A rendered interactive view would be fun.
- Indexing non-IMDb series, for example downloaded YouTube videos that are part of a series, `S5#1` etc.
- Download sponsorblock data and use it to skip sponsor segments in videos. Reusing chapter logic would make the most sense, maybe a `skippable` flag and a `auto_skip` flag or whether the skip button shows/whether it auto skips respectively. Would also require youtube IDs in the path or resolved somehow.
- Smart tags using CLIP vectors
  - Upload/select example images that DO contain the tag
  - Upload/select examples images that DO NOT contain the tag
  - Use CLIP to find images that are similar to the selected images and dissimilar to the unselected images
  - Tag those images with the given tag
  - If the tag is removed from an image manually, automatically add it to the "does not contain" list
  - If the tag is added to an image manually, automatically add it to the "does contain" list (if enabled)
- A page that displays all the photos exif coordinates on a map and you can click on each pin to see the individual photos.
  - [Pigeon maps](https://pigeon-maps.js.org/) will be good for this
- Run CLIP on generated file names and use that for search as well
  - I have no clue how you would search text and image vectors at the same time
  - This would let search take the metadata from the file name into account, for example a file named `Ryan at the Park.jpg` would take priority over `Tim at the Park.jpg` if you searched for just `ryan`. In theory anyway, in practice I'm not sure that's how it would work but it can't hurt. Probably.
- Include JSON, SQLite, CSV and XML files in scans and pull metadata from them.
  - Lots of tools can write metadata to these files about downloads, but there is no standard format. So using an LLM to extract the metadata would be perfect.
