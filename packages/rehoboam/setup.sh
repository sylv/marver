mkdir -p test/images
cd test/images

wget -q https://cdn.openai.com/multimodal-neurons/assets/apple/apple-ipod.jpg
wget -q https://cdn.openai.com/multimodal-neurons/assets/apple/apple-blank.jpg
wget -q 'https://images.unsplash.com/photo-1566467021888-b03548769dd1?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&dl=svetlana-gumerova-hQHm2D1fH70-unsplash.jpg&w=640' -O cold_drink.jpg
wget -q 'https://images.rawpixel.com/image_1300/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdXB3azU4ODU5NzY1LXdpa2ltZWRpYS1pbWFnZS1rb3diMmhkeC5qcGc.jpg' -O hot_drink.jpg
wget -q https://storage.googleapis.com/big_vision/siglip/authors.jpg
wget -q https://storage.googleapis.com/big_vision/siglip/siglip.jpg
wget -q https://storage.googleapis.com/big_vision/siglip/caffeine.jpg
wget -q https://storage.googleapis.com/big_vision/siglip/robosign.jpg
wget -q https://storage.googleapis.com/big_vision/siglip/fried_fish.jpeg
wget -q 'https://pbs.twimg.com/media/FTyEyxyXsAAyKPc?format=jpg&name=small' -O cow_beach.jpg
wget -q 'https://storage.googleapis.com/big_vision/siglip/cow_beach2.jpg' -O cow_beach2.jpg
wget -q 'https://pbs.twimg.com/media/Frb6NIEXwAA8-fI?format=jpg&name=medium' -O mountain_view.jpg