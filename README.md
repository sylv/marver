<p align="center">
  <img src="./assets/logo-large.png" height="128" width="128" />
</p>

# marver

> **Warning**
> marver is not ready, there is very little UI and there are no guarantees it won't photoshop all your family photos with clown hats on your uncle. Watch the repo for updates, or come back in a few months.

marver scours your files and makes them all pretty and viewable, pulling as much information as possible.

### ideas/todo

- Search
  - If someone searches for `pink clouds` and a `clouds` tag exists, add the `clouds` tag to the file filter.
  - If someone searches `pink clouds #australia` then `australia` should be added as a tag filter, and `pink clouds` should be used as the semantic search term.
  - If a search query contains a name, bias towards images with that face
  - Index the file name as an embedding
  - Index text from OCR
  - Negate search terms with `-`, for example `apple -device` would search for apples, not apple devices.
  - Upload a photo/video and use perceptual hash/embeddings to find similar images/videos
  - Index existing and generated subtitles
    - Clicking on a subtitle-provided result will take you to that time in the video
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
  - Clean up OCR results automaticaly and/or with a small LLM
  - Translate OCR results into the user's language
  - Overlay the bounding box on the image for copy/paste
  - Run OCR on videos
    - It might be possible to train a small model that takes in CLIP embeddings and determines if a frame has text in it.
    - Only running OCR on frames "different enough" from the last one would be a good optimization
- Extract metadata from other files
  - If `img_22.png` and `img_22.png.json` (json/xml/csv), try rip data from the json file and use it as metadata.
  - If we find `.sqlite` or `.db` files, a small LLM could check if they contain useful metadata and extract it in bulk if they do.
  - Having some recognised schemas for common formats would be good - tools like `yt-dlp`, `gallery-dl` and others may be common sources of metadata with standard formats we have schemas for.
  - As a fallback, a small LLM could generate schemas for metadata files we find, which we can then blindly apply to other files just like the preset schemas we might have.
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
