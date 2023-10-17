<p align="center">
  <img src="./assets/logo-large.png" height="128" width="128" />
</p>

# marver

> **Warning**
> marver is not ready, there is very little UI and there are no guarantees it won't photoshop all your family photos with clown hats on your uncle. Watch the repo for updates, or come back in a few months.

marver takes your messy, unorganised media and turns it into your personal video player, photo viewer and media library.

marver will index your media and make it as user-friendly as possible. Point marver at your nas and it will extract information as best it can based on the file name, file contents, supporting files (subtitles, json, etc) and whatever else it can get its grubby little hands on. marver will take all that information and make it searchable, filterable, and viewable. If it can't find enough metadata, you can help push it in the right direction - attach a YouTube ID, IMDb ID, etc to a file and it'll grab the view count, comments, plot, poster, etc and display it along side the file. It's like Plex but for more than just movies and tv shows, and with a stronger focus on extracting metadata. Have a load of family photos laying around on your NAS? Let marver index them and generate albums based on faces, locations, dates, etc.

## working-ish features

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

<sup>2. perceptual hashes for videos are generated, but detecting overlaps and intros is not implemented yet.</sup>

<sup>3. Faces are extracted and stored, but you cannot tie a name to a face yet. You can search for similar faces using `face:face_id` which will order by similarity. I'm not sure how to go about assigning a name to a face and matching other face matches to a name just yet.</sup>

### ideas

- LLM integrations
  - Completely gimmicky but it would be an easy way to get a lot of powerful features in, then come back and train dedicated models for them later.
  - Extract metadata from file names and other sources extremely easily.
  - Convert metadata files that live along side files to usable data, no matter the metadata format.
    - It would also be cool if it could look at .sqlite files on disk and see if they are relevant, and if they are, generating SQL to query them and extract information. Some tools like `gallery-dl` will dump a load of metadata into an sqlite file, but that data is pretty much inaccessible without specialized tooling.
  - Generate clean names for files, `my_photo_2019_1.jpg` -> `My Photo`.
    - Once metadata is extracted, it could take into account all metadata. The file name might just be a hash, but metadata resolution might have found a website that has a better title, and extra information like view counts and artists involved. Combining all that into a title would be cool.
  - Generating galleries from file names, `my_photo_21.jpg` and `my_photo_22.jpg` should be together
    - This is easy to do in code for obvious situations, but parsing edge cases is hard.
  - Looking up metadata for files (for example, looking for a plot summary on wikipedia instead of a specific API integration to do it), that would also let it pull metadata from other sites like youtube, tvdb, reddit.
    - It is unlikely a small 7b model would be powerful enough to generate and process search results, but maybe with fine-tuning?
    - This wouldn't scale to millions of files. Maybe it could only be run on files that have no metadata from other sources and that are fairly unique?
  - Cleaning up OCR and voice-to-text results
  - Generating SQL queries based on user input.
- Run [whisper](https://github.com/openai/whisper) on videos and generate subtitles for them.
- Index subtitles for search
  - Clicking on a subtitle result will take you to that time in the video
  - We should index both generated and existing subtitles
- Facial recognition
  - Ability to add names to faces
  - Find all images with a face by clicking on it
  - Searching for a name will bias towards images with that face
- Reverse image/video search. Upload an image and use the perceptual hashes to find similar images/videos.
  - This can work for videos using the stored perceptual hashes, you could even find videos based on a screenshot of them.
- Run OCR on images and videos
  - Index the text and use that for search
  - Run translatelocally, libretranslate or even an LLM if we already have it to translate the text, and with an LLM we can even use it to clean it up or provide context (especially if it can "see" the image with CLIP, but I doubt we're gonna get that advanced)
  - Overlay the text invisibly with the same bounding box on the image so you can copy/paste it.
  - Running on videos would be useful, for example if a sign is shown in the video, or a logo shows up that could let you easily group all videos from that studio based on the logo. But, it would be expensive computationally and probably quite slow. Maybe using a faster but less accurate OCR model on videos would be better? If so, it would be good to run the big OCR model on maybe 2-5 screenshots because it might grab logos a weaker one cannot, then the rest can be done with a faster model.
- Include JSON, SQLite, CSV and XML files in scans and pull metadata from them.
  - Lots of tools can write metadata to these files about downloads, but there is no standard format. So using an LLM to extract the metadata would be perfect.
- Batch ffmpeg segments into a single command. This should be faster and let ffmpeg be much more aggressive with transcoding.
  - It would make sense to only do this for segments later on, and keep the first few individual because getting them out the door as fast as possible is more important initially.
- Sync the video position to the server so it remembers where you stopped watching
  - Only do this on longer (>5m) videos and only after you've actually watched for a few minutes (skipping a few minutes in should not count).
  - Show half watched videos in a "continue watching" section
- Sync the video position to localStorage every second so accidentally closing a tab and reopening it will immediately pick up where you left off
- Mute videos if they contain tags like `bad_audio`, `corrupted_audio`, etc.
- Automatically scan for gallery indexes in file names and generate collections from them, or just show them in a "related" panel.
  - For example, `[galleryIndex=1]` in file names. It would have to base it off some other identifier, like an id or clean file name.
  - Require all entries to be in the same folder
  - Limit the max per automatic collection to like 50 or something
  - Require all gallery indexes to be present. If there are only `0` and `2` in a folder, don't create a collection for it.
- Tags should be a graph.
  - An "apple pie" tag would be a child of the "food" tag. Searching for "food" also searches for "apple pie", as well as "burger" and other related tags.
- Extract tags in file names like `my photo #beach #dog`
- An option to cache the transcode result of the first 15-30 seconds of every video
  - This would be excellent for slow remote mounts, we can start the stream quickly and hopefully we can start reading the real file before the cache runs out.
  - Filtering options would be good, so for example only videos over 10gb in the `media/movies` folder would be cached.
- Sort options (tag count, date scanned, date created, size, bitrate, title, type, duration, resolution, views, favourites, path, randomly, etc)
- Use `<img srcset />` and let the browser decide on the best image type, instead of guessing based on the `Accept` header.
- Storage breakdown page. Show % of images, videos, other. Could be cool to also show a bar at the bottom of images/photos to show duplicates or very similar images. [MacOS storage breakdown](https://i.imgur.com/hoBR9zF.png) would be a good example.
  - A pie graph showing storage usage by type would also be cool
  - Being able to see the average size of each type would be very cool
  - Being able to see storage usage for a folder would be poggers
- Detect movie intros the same way as episode intros but across all movies instead of a single season, and provide and option to skip them. We can also account for intros we haven't seen if we detect intros either side and assume the stuff between them is another intro.
- Previews for STL/OBJ/3D files. A rendered interactive view would be fun.
- Ensure indexing works for non-IMDb/little known series, for example downloaded YouTube videos that are part of a series, `S5#1` etc.
- Encode the embedding source in the `Embedding` struct and throw errors when trying to compare one type to another. This guards against swapping CLIP models to one that doesn't have compatible embeddings, or other issues.
- Run CLIP on generated file names and use that for search as well
  - I have no clue how you would search text and image vectors at the same time
  - This would let search take the metadata from the file name into account, for example a file named `Ryan at the Park.jpg` would take priority over `Tim at the Park.jpg` if you searched for just `ryan`. In theory anyway, in practice I'm not sure that's how it would work but it can't hurt. Probably.
- Pressing the right arrow with a skip intro/credits button on screen should skip to the end of the intro, not the normal +30s
- Check the file chapters for existing intro/credit chapters and if they exist, use those instead of trying to pull our own.
- Sync photos from your phone to marver
  - iOS would will be hard
  - Would be totally cool though
  - This would make more sense once marver gets file upload capabilities
- Allow `+` and `-` in queries, for example `apple -device` would search for apples, not apple devices.
- Store thumbnails for large (5mb+) images
- Image proxy should have an option to strip EXIF metadata on images before sending them
- TV show intros/credits can be detected more efficiently by detecting them on one episode, then checking the rest of the episodes for the same timestamps. If the frames match +- 5 seconds, the timestamps can be reused.
- When a user queries a file directly, prioritize tasks for that file. With graphql subscriptions we can push additional metadata to the client as it becomes available.
- Embeddings for sections of videos (30s chunks? or split by chapter markings?) that include subtitles so you could search for a part of a video from a description of the scene, without knowing the exact words used.
