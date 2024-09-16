# marver

<img alt="Marver uses Vite, Tailwind, NestJS, TypeScript, Docker and GraphQL" src="https://skillicons.dev/icons?i=vite,tailwind,nest,typescript,docker,graphql" />

> [!WARNING]
> marver is not ready, there is very little UI and there are no guarantees it won't photoshop all your family photos with clown hats on your uncle. 
> Check back in a few months.

marver indexes your files and makes them easy to search.

### ideas

- Split up videos into chapters and extract faces, then searching for eg "john and mary" will search for pictures and video chapters with both of them.
  - This lets us do "AND" searches for faces in videos even when the faces only appear in different frames.
- Search
  - If someone searches for `pink clouds` and a `clouds` tag exists, add the `clouds` tag to the file filter.
  - If someone searches `pink clouds #australia` then `australia` should be added as a tag filter, and `pink clouds` should be used as the semantic search term.
  - If a search query contains a name, bias towards images with that face
  - Index the file name as an embedding
  - Index text from OCR
  - Negate search terms with `-`, for example `apple -device` would search for apples, not apple devices.
  - Upload a photo/video and use perceptual hash/embeddings to find similar images/videos
    - Upload a picture of an object and it finds all pictures/videos with that object
  - Index existing and generated subtitles
    - Clicking on a subtitle-provided result will take you to that time in the video
  - Embeddings can be quantized with minimal quality loss. 1.58-bit quantization is possible, then once you have a small set of results run full-precision comparisons.
- Subtitles
  - Use [whisper](https://github.com/openai/whisper) to generate subtitles.
  - Extract existing subtitles from files
- Face recognitition
  - Find all images with a face by clicking on that face
  - Its possible to auto-guess names for faces.
    - If a file named `ryan soccer 2002.jpg` has a single face, it's a good indicator that the person's name is "Ryan".
    - If a file named `dave ryan.jpg` and `ellie ryan.jpg` exist, we can assume that the name "Ryan" is for the face that is in both photos.
    - If we have enough of these matches we can be fairly confident in the name.
- OCR
  - A small LLM or vLLM could be used to clean up OCR results
  - Translate OCR results into the user's language
  - Overlay a hidden bounding box w/ text on the image for copy/paste
  - Using CLIP embeddings to filter for images with text and without text would save us running OCR unnecessarily
  - Run OCR on videos
    - Only running OCR on frames "different enough" from the last one would be a good optimization
- Extract metadata from other files
  - If `img_22.png` and `img_22.png.json` (json/xml/csv), try rip data from the json file and use it as metadata.
  - If we find `.sqlite` or `.db` files, a small LLM could check if they contain useful metadata and extract it in bulk if they do.
  - Having some recognised schemas for common formats would be good - tools like `yt-dlp`, `gallery-dl` and others may be common sources of metadata with standard formats we have schemas for.
  - As a fallback, a small LLM could generate strict schemas for metadata files we find, which we can then blindly apply to other files just like the preset schemas we might have.
- Automatic collections
  - Folders under the source folder should always become a collection, `photos/2021/August` should be in a `August` collection that is a child of the `2021` collection.
  - Look for gallery indexes in file names and generate collections from them
    - `img_1.png` and `img_2.png` should be in a collection together
    - Heuristics will probably be useful here. If there are lots of gaps, `img_1.png` and `img_3.png` we should probably ignore it. If there are only one or two gaps across two dozen photos, we should probably include them.
    - Don't generate collections that are too large, maybe 50 items max.
  - Use a small LLM or train a model to find and generate collections that aren't as obvious.
- Tags
  - Tags should be a graph
    - If you have an `apple pie` tag that is a child of the `pies` tag, searching for `pies` should also search for `apple pie`.
- Support other media types
  - `STL/OBJ/3D` files should have a rendered interactive view and have thumbnails
  - PDFs, markdown, and other text-based files should be viewable with thumbnails
  - Index text from text-based files (pdfs, markdown, txt)
- Option to store data in EXIF
  - If the user adds a location to an image, or updates its tags, we should have an option to add that to the image EXIF data.
  - Ideally, we want all the data we store to be replaceable. The files themselves are what's important, not the .sqlite file indexing them.
  - This should not be default, but it should be an obvious option.
  - Anything we can write to EXIF we should be able to pull back out
  - We should never overwrite existing metadata. 
    - This is tricky, sometimes its okay to overwrite metadata. For example, scanned images will have the date set to the time scanned when they should really be set to the time the photo was taken.
    - We don't want to destroy metadata and replace it with the wrong data - what if we run OCR on a photo and detect a date, so we put that in the image tags, but it turns out we used month/day instead of day/month formatting and it's wrong?
- Shortcuts
  - In the sidebar, have a "shortcuts" link at the bottom that opens a little panel showing the shortcuts. Having shortcuts but not showing them is a waste.
  - `Ctrl + T` to quickly add tags to an image
  - `Ctrl + D` to show debug layers of images (for example, outlines of detected faces, OCR outlines, etc)
- It would be cool to run face detection, then run age detection on the detected faces, then show photos of a person on a timeline of their life.
- Support originals and edited versions
  - Sometimes you want to store the raw, unedited version of an image, but it is near unviewable. So you create an edited version which you can show people. But when you want to add metadata, you don't want to add it to the edited version.
  - So, we should support having an original and edited version of a file. The edited version is shown by default but the original is where metadata is written to and pulled from primarily.
  - It would be good to have warnings if the edited version has more metadata than the original - ideally we should treat the edited version as disposable.
  - It would make sense to support multiple child versions that are called something else for files where eg, you might have a 4k version and a 1080p version.
  - This needs more thought.

### todo

- Storing thumbnails, screenshots, timeline previews, etc in sqlite may make sense for large libraries.
  - [For <100KB files with the right page size, sqlite can outperform storing file paths](https://www.sqlite.org/intern-v-extern-blob.html)
  - It makes manageament of metadata far easier
  - It should be separate from the main database and everything in it should regenerate if deleted, to make cleanup easy.
- Sign imgproxy/vidproxy/etc urls to prevent tampering/access to files that shoudlnt be allowed
- Setup auth/acl, doing it earlier will be better
- Show similarity scores on related images
- Thresholds for things like face matching should be tested against a real dataset so we can find optimal thresholds for a target accuracy, and provide a table for users to pick what they'd rather.
- Face detection/embedding batching
- Make a package for efficiently storing and comparing embeddigns
  - Should be a rust crate and nodejs package
  - Should store embeddings as efficiently as possible
  - Store quantized and source embeddings along side
- Refactor queues
  - Have type-safe batching and inheritance
  - Running the GraphQL server on a different thread would be a good idea to stop the UI locking up
- We can use embeddings to filter jobs for images
  - For example, train a model/create an embedding for "images with faces". We can then use that to filter out images that don't have faces before running face recognition.
  - This can be done for any "expensive" job that can be represented as an embedding, for example OCR.
- `rehoboam` hub downloads lock up node process
- Caching should be partially based on the time to compute the value, for example computing a preview for a 100mb image takes 10s and computing one for a 2kb jpeg takes a couple milliseconds. The 100mb image should be cached for longer.
- A few places combine embeddings into one by adding the values together. This might result in poor results, there should be a better way.
- On other pages, it should prefill the search bar with filtering for things in that page.
  - On collection pages, the search bar should automatically include `collection:<name>` in the search
  - On person pages, the search bar should automatically include `person:<name>` in the search
  - This will help users become familiar with search and how operators can be used.