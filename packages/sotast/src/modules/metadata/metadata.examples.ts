import { MetadataCategory } from './entities/metadata.entity.js';

// todo: i think either all of these should start with a directory, or none should.
// none might help embeddings match better, but all of them including a directory might "teach"
// the LLM better, given that it will be closer to the others it gets.
export const METADATA_EXAMPLES = [
  {
    data: {
      path: 'Avatar - The Last Airbender/Book 3; Fire/301 - The Awakening.mp4',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'The Awakening',
      seasonNumber: 3,
      episodeNumbers: [1],
      series: {
        title: 'Avatar - The Last Airbender',
      },
    },
  },
  {
    data: {
      path: 'avatar_the_last_airbender/Book 3; Fire/314 - The Boiling Rock, Part 1.mp4',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'The Boiling Rock, Part 1',
      seasonNumber: 3,
      episodeNumbers: [14],
      series: {
        title: 'avatar_the_last_airbender',
      },
    },
  },
  {
    data: {
      path: '/media/tv/Mr. Robot (2015) {imdb-tt4158110}/Season 1/Mr. Robot (2015) - S01E08 - eps1.7_wh1ter0se.m4v [Bluray-1080p][AAC 5.1][x265].mkv',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'eps1.7_wh1ter0se',
      seasonNumber: 1,
      episodeNumbers: [8],
      series: {
        title: 'Mr. Robot',
        imdbId: 'tt4158110',
      },
    },
  },
  {
    data: {
      path: '/archived/Mad_Season_1994/gallery-dl/imgur/imgur_16e9d7f_the_sky_was_purple_today.png',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'the sky was purple today',
      sources: ['imgur'],
      artists: ['Mad_Season_1994'],
      contentIds: ['16e9d7f'],
    },
  },
  {
    data: { path: '[rdt].23.02.01.Moving.On.Part.1.1080p.HEVC.h264-ABD.mkv' },
    result: {
      category: MetadataCategory.Generic,
      title: 'Moving On Part 1',
      sources: ['rdt'],
      partialDate: [2023, 2, 1],
    },
  },
  {
    data: { path: 'Every Cash Converters Ever [W1jdobiPM3I].mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: 'Every Cash Converters Ever',
      contentIds: ['W1jdobiPM3I'],
    },
  },
  {
    data: { path: 'gclips.me_wXDeRM1MlXg_every_dying_youtube_channel_720p.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: 'every dying youtube channel',
      sources: ['gclips.me'],
      contentIds: ['wXDeRM1MlXg'],
    },
  },
  {
    data: { path: 'Emily_ZA-7412317811701639154-20200722_683210-vid1.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: 'vid1',
      artists: ['Emily_ZA'],
      contentIds: ['7412317811701639154', '683210'],
      galleryIndex: 1,
      partialDate: [2020, 7, 22],
    },
  },
  {
    data: {
      path: '/personal/photos/unsorted/foolishforkedabyssiniancat-mobile.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['foolishforkedabyssiniancat'],
    },
  },
  {
    data: { path: 'e0b5e36954b0570ba41c655ff4149d2b.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['e0b5e36954b0570ba41c655ff4149d2b'],
    },
  },
  {
    data: { path: 'COOL_VIDEO_20230421_134943_165.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: 'COOL VIDEO',
      contentIds: ['134943'],
      partialDate: [2023, 4, 21],
    },
  },
  {
    data: {
      path: '2012 (2009) {imdb-tt1190080} [Bluray-1080p][DTS 5.1][x265]-Joy.mkv',
    },
    result: {
      category: MetadataCategory.Movie,
      title: '2012',
      year: 2009,
      imdbId: 'tt1190080',
    },
  },
  {
    data: {
      path: 'Catch Me If You Can (2002) [imdb-tt0264464][Bluray-1080p][8bit][x264][AC3 5.1]-ETRG.mp4',
    },
    result: {
      category: MetadataCategory.Movie,
      title: 'Catch Me If You Can',
      year: 2002,
      imdbId: 'tt0264464',
    },
  },
  {
    data: {
      path: 'Arcane (2021) - S01E05 - Everybody Wants to Be My Enemy [NF WEBDL-1080p][EAC3 5.1][x265]-t3nzin.mkv',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'Everybody Wants to Be My Enemy',
      seasonNumber: 1,
      episodeNumbers: [5],
      series: {
        title: 'Arcane',
      },
    },
  },
  {
    data: {
      path: 'Archer (2009) {imdb-tt1486217}/Season 9/Archer (2009) - S09E08 - A Discovery [AMZN WEBDL-1080p][EAC3 5.1][h264]-NTb.mkv',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'A Discovery',
      seasonNumber: 9,
      episodeNumbers: [8],
      series: {
        title: 'Archer',
        year: 2009,
        imdbId: 'tt1486217',
      },
    },
  },
  {
    data: {
      path: "Tom Clancy's Jack Ryan (2018) - S01E08 - Inshallah [AMZN WEBDL-1080p][EAC3 5.1][x265].mkv",
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'Inshallah',
      seasonNumber: 1,
      episodeNumbers: [8],
      series: {
        title: "Tom Clancy's Jack Ryan",
        year: 2018,
      },
    },
  },
  {
    data: { path: 'BigBuckBunny_640x360.m4v' },
    result: {
      category: MetadataCategory.Movie,
      title: 'Big Buck Bunny',
    },
  },
  {
    data: {
      path: "Bob's Burgers 2011 SE 1 - 8 Complete Eng Only Burntodisc/SE1/02 Human Flesh.mp4",
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'Human Flesh',
      seasonNumber: 1,
      episodeNumbers: [2],
      series: {
        title: "Bob's Burgers",
        year: 2011,
      },
    },
  },
  {
    data: {
      path: 'The Hobbit & The Lord of The Rings Extended Trilogy 1080p 10bit BluRay x265 HEVC MRN/The Lord of The Rings Trilogy Extended Cut 1080p 10bit BluRay x265 HEVC 6CH -MRN/1-Fellowship.of.The.Ring.2001.Extended.Cut.1080p.10bit.BluRay.x265.HEVC.6CH-MRN.mkv',
    },
    result: {
      category: MetadataCategory.Movie,
      title: 'The Lord of the Rings: Fellowship of The Ring',
    },
  },
  {
    data: {
      path: '/torrents/completed/The EXPANSE - Complete Season 3 S03 (2018) - 1080p AMZN Web-DL x264/The EXPANSE - S03 E11 - Fallen World (1080p - AMZN Web-DL).mp4',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'Fallen World',
      seasonNumber: 3,
      episodeNumbers: [11],
      series: {
        title: 'The EXPANSE',
        year: 2018,
      },
    },
  },
  {
    data: {
      path: 'Avatar (TLoK) - S03 E12 - Enter the Void (1080p - BluRay).mp4',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'Enter the Void',
      seasonNumber: 3,
      episodeNumbers: [12],
      series: {
        title: 'Avatar (TLoK)',
      },
    },
  },
  {
    data: {
      path: 'The Simpsons (1989-2018) Seasons 01-29 & Movie [1080p] [Ultimate Batch] [HEVC] [x265] [pseudo]/Season 07/The Simpsons - S07E25 - Summer of 4 Ft 2 [1080p] [x265] [pseudo].mkv',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'Summer of 4 Ft 2',
      seasonNumber: 7,
      episodeNumbers: [25],
      series: {
        title: 'The Simpsons',
        year: 1989,
      },
    },
  },
  {
    data: {
      path: '/shared/The Hunger Games 4 Film Complete Collection 1080p BluRay 5.1Ch x265 HEVC SUJAIDR/The Hunger Games Mockingjay Part 2 (2015) 1080p BluRay 5.1Ch x265 HEVC SUJAIDR.mkv',
    },
    result: {
      category: MetadataCategory.Movie,
      title: 'The Hunger Games Mockingjay Part 2',
      year: 2015,
    },
  },
  {
    data: {
      path: '/data/[TorrentCouch.com].Silicon.Valley.S05.Complete.720p.BRRip.x264.ESubs.[1.6GB].[Season.5.Full]/[TorrentCouch.com].Silicon.Valley.S05E01.720p.BRRip.x264.ESubs.mkv',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      seasonNumber: 5,
      episodeNumbers: [1],
      series: {
        title: 'Silicon Valley',
      },
    },
  },
  {
    data: {
      path: '/Downloads/Top Gear UK 1-17/Top Gear - Season 7/Top Gear - [07x06] - 2005.12.27 [GOTHiC].avi',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      seasonNumber: 7,
      episodeNumbers: [6],
      series: {
        title: 'Top Gear',
      },
    },
  },
  {
    data: {
      path: '/torrents/completed/Top Gear UK 1-17/Top Gear - Season 10/(auto) Top Gear - 10.07.2008 - [10x01] - [Greatest road in EU].avi',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'Greatest road in EU',
      seasonNumber: 10,
      episodeNumbers: [1],
      series: {
        title: 'Top Gear (UK)',
      },
    },
  },
  {
    data: {
      path: '/torrents/completed/Love.Death.and.Robots.S01.ITA.ENG.1080p.NF.WEB-DLMux.DD5.1.x264-Morpheus/Love.Death.and.Robots.1x01.Il.Vantaggio.di.Sonnie.ITA.ENG.1080p.NF.WEB-DLMux.DD5.1.x264-Morpheus.mkv',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'Il Vantaggio di Sonnie',
      seasonNumber: 1,
      episodeNumbers: [1],
      series: {
        title: 'Love Death and Robots',
      },
    },
  },
  {
    data: {
      path: 'Archer S01e01-10/Archer.1x05.Honeypot.1080p.BDMux.ITA.ENG.Subs.x264-Fratposa.mkv',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'Honeypot',
      seasonNumber: 1,
      episodeNumbers: [5],
      series: {
        title: 'Archer',
      },
    },
  },
  {
    data: {
      path: '/clone/Family Guy - Complete H265/Season 17 [1080p x265][MP3 5.1]/Family.Guy.S17E16 [1080p Web x265][MP3 5.1].mp4',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      seasonNumber: 17,
      episodeNumbers: [16],
      series: {
        title: 'Family Guy',
      },
    },
  },
  {
    data: {
      path: "TV Shows/Trailer.Park.Boys.Season.9.[1080p].[HEVC]/S09E05.The.Motel.Can't.Live.at.the.Motel.mkv",
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: "The Motel Can't Live at the Motel",
      seasonNumber: 9,
      episodeNumbers: [5],
      series: {
        title: 'Trailer Park Boys',
      },
    },
  },
  {
    data: { path: 'The Expanse S0E0.mp4' },
    result: {
      category: MetadataCategory.TVEpisode,
      seasonNumber: 0,
      episodeNumbers: [0],
      series: {
        title: 'The Expanse',
      },
    },
  },
  {
    data: { path: '/videos/Test Group/videos/Test Group compilation.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: 'Test Group compilation',
    },
  },
  {
    data: {
      path: '/home/data/readonly/Group Trip/videos/Some Interesting Video-1.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Group Trip: Some Interesting Video',
      galleryIndex: 1,
    },
  },
  {
    data: { path: 'Amphibia S01E21-22 Grubhog Day & Hop Pop and Lock' },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'Grubhog Day & Hop Pop and Lock',
      seasonNumber: 1,
      episodeNumbers: [21, 22],
      series: {
        title: 'Amphibia',
      },
    },
  },
  {
    data: { path: 'The Expanse S01E01-03.mp4' },
    result: {
      category: MetadataCategory.TVEpisode,
      seasonNumber: 1,
      episodeNumbers: [1, 2, 3],
      series: {
        title: 'The Expanse',
      },
    },
  },
  {
    data: { path: '/dl/YT Hunter and Ari/Hunter-YouTube-09-12-23 Part 3.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      sources: ['YouTube'],
      artists: ['Hunter', 'Ari'],
      galleryIndex: 3,
      partialDate: [2023, 12, 9],
    },
  },
  {
    data: {
      path: '/media/Chin Leigh/Chin Leigh Archive (last update - 22-11-2012)/Sets/3. August 2011/12. Schlatt/20-08-2011_Schlatt (12).jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Schlatt',
      artists: ['Chin Leigh'],
      galleryIndex: 12,
      partialDate: [2011, 8, 20],
    },
  },
  {
    data: {
      path: '/personal/family/photos/495 Tennessee Avenue/initial contract/IMG_1201.JPG',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      locationName: '495 Tennessee Avenue',
    },
  },
  {
    data: {
      path: '/photos/Photos by year/1980/Karen Nieves 10th Birthday with Edward Douglas gene and Miriam November 1980 Whitetail.JPG',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Karen Nieves 10th Birthday with Edward Douglas gene and Miriam',
      artists: ['Karen Nieves', 'Edward Douglas', 'gene', 'Miriam'],
      locationName: 'Whitetail',
      partialDate: [1980, 11, null],
    },
  },
  {
    data: {
      path: '/personal/family/photos/Photos by year/2007/22 Shingleton/Oneida & David in tub 2.JPG',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Oneida & David in tub',
      artists: ['Oneida', 'David'],
      galleryIndex: 2,
      locationName: '22 Shingleton',
      partialDate: [2007, null, null],
    },
  },
  {
    data: {
      path: '/Users/Admin/Photos/persönlich/familie/fotos/Fotos nach Jahr/2015/2015-07/285.JPG',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      galleryIndex: 285,
      partialDate: [2015, 7, null],
    },
  },
  {
    data: {
      path: '/personal/family/photos/Photos by year/1973/Charles St Farmington Antonio 1 month.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Antonio 1 month',
      artists: ['Antonio'],
      locationName: 'Charles St, Farmington',
      partialDate: [2000, null, null],
    },
  },
  {
    data: {
      path: '/family/personal/images by year/2013/Tracy at 22 months Broad St, Birmingham.jpeg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Tracy at 22 months',
      artists: ['Tracy'],
      locationName: 'Broad St, Birmingham',
      partialDate: [2013, null, null],
    },
  },
  {
    data: { path: '/YearlyPhotos/2005/Birmingham_RomeRd_Allen3mo_2005.jpg' },
    result: {
      category: MetadataCategory.Generic,
      title: 'Allen 3 months',
      artists: ['Allen'],
      locationName: 'Rome Rd, Birmingham',
      partialDate: [2005, null, null],
    },
  },
  {
    data: {
      path: '/pictures/Photos_by_year/millenium/2000_Portola_ByersLane_John_3months.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'John 3 months',
      artists: ['John'],
      locationName: 'Byers Lane, Portola',
      partialDate: [2000, null, null],
    },
  },
  {
    data: { path: '2429283432_397378271383319_8826130039834042512_o.webp' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['2429283432', '397378271383319', '8826130039834042512'],
    },
  },
  {
    data: {
      path: 'Bleep Blopp - Anish Carson , Scott Aguilar , Madeline Holder , DJ , Fergus Gilbert and Brett  (19273).mkv',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Bleep Blopp',
      artists: [
        'Anish Carson',
        'Scott Aguilar',
        'Madeline Holder',
        'DJ',
        'Fergus Gilbert',
        'Brett ',
      ],
      contentIds: ['19273'],
    },
  },
  {
    data: {
      path: 'How to wash your pet ghecko by Chloe Mitchell [9027812].mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'How to wash your pet ghecko by Chloe Mitchell',
      artists: ['Chloe Mitchell'],
      contentIds: ['9027812'],
    },
  },
  {
    data: { path: 'faa.12.03.02.katrina.wagner.wmv' },
    result: {
      category: MetadataCategory.Generic,
      title: 'katrina wagner',
      sources: ['faa'],
      artists: ['katrina wagner'],
      partialDate: [2012, 3, 2],
    },
  },
  {
    data: { path: 'pack12.22.jpg' },
    result: {
      category: MetadataCategory.Generic,
      title: 'pack12',
      galleryIndex: 22,
    },
  },
  {
    data: { path: 'YouTube.22.09.08.Full.Monty.XXX.1080p.HEVC.x265.KURT.mkv' },
    result: {
      category: MetadataCategory.Generic,
      title: 'Full Monty',
      sources: ['YouTube'],
      partialDate: [2022, 9, 8],
    },
  },
  {
    data: { path: 'Stannis_Welcome-to-the-thunder-dome.mkv' },
    result: {
      category: MetadataCategory.Generic,
      title: 'Welcome to the thunder dome',
      artists: ['Stannis'],
    },
  },
  {
    data: {
      path: '[NBC] Ashton Tucker - Hitchhikers guide to your mum 3 (22.1.2002)-Bre.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Hitchhikers guide to your mum',
      sources: ['NBC'],
      artists: ['Ashton Tucker'],
      galleryIndex: 3,
      partialDate: [2002, 1, 22],
    },
  },
  {
    data: {
      path: '[twitchtv] jess203 - Pride month and other things_13_02_2008.mkv',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Pride month and other things',
      sources: ['twitchtv'],
      artists: ['jess203'],
      partialDate: [2008, 2, 13],
    },
  },
  {
    data: { path: 'archive.org_37133_Tiffany Sloan dancing.mkv' },
    result: {
      category: MetadataCategory.Generic,
      title: 'Tiffany Sloan dancing',
      sources: ['archive.org'],
      artists: ['Tiffany Sloan'],
      contentIds: ['37133'],
    },
  },
  {
    data: {
      path: '27422572_Me and the boys hit the griddy too hard yesterday 🤤😪 That didn’t st.._05_3ce75114-4f5a-11ee-be56-0242ac120002.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Me and the boys hit the griddy too hard yesterday 🤤😪 That didn’t st..',
      contentIds: ['27422572', '3ce75114-4f5a-11ee-be56-0242ac120002'],
      galleryIndex: 5,
    },
  },
  {
    data: {
      path: '68636857_I couldn’t stop it, in the end nothing mattered .._02_2961c732-4f5a-11ee-be56-0242ac120002.m4v',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'I couldn’t stop it, in the end nothing mattered ..',
      contentIds: ['68636857', '2961c732-4f5a-11ee-be56-0242ac120002'],
      galleryIndex: 2,
    },
  },
  {
    data: {
      path: 'Mercer - Jschlatt Short Drunk Driving Death Accident Twitch.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Jschlatt Short Drunk Driving Death Accident',
      sources: ['Twitch'],
      artists: ['Mercer', 'Jschlatt'],
    },
  },
  {
    data: { path: 'CBT.com20230301-001_BenjiiWrapped.jpg' },
    result: {
      category: MetadataCategory.Generic,
      title: 'Benjii Wrapped',
      sources: ['CBT.com'],
      artists: ['Benjii'],
      galleryIndex: 1,
      partialDate: [2023, 3, 1],
    },
  },
  {
    data: {
      path: '(m=llfGe-yuuGqrrdg)(mh=KZC2hRFqqtWzx_XM)original_105366629.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['llfGe-yuuGqrrdg', 'KZC2hRFqqtWzx_XM', '105366629'],
    },
  },
  {
    data: { path: '720P_1500K_98325531.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['98325531'],
    },
  },
  {
    data: { path: '9eb0f8bffc5e351b8c61f26bcd58f8bf.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['9eb0f8bffc5e351b8c61f26bcd58f8bf'],
    },
  },
  {
    data: {
      path: '(m=lflGe-yarGqaddg)(mh=v_2GwpdtF1Mp5_1A)original_305671721.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['lflGe-yarGqaddg', 'v_2GwpdtF1Mp5_1A', '305671721'],
    },
  },
  {
    data: { path: 'AjPH6tH.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['AjPH6tH'],
    },
  },
  {
    data: { path: 'NA - Ssssmith Unuploaded - jerrysinging.webm.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: 'jerry singing',
      artists: ['Ssssmith', 'jerry'],
    },
  },
  {
    data: {
      path: 'people/James/Boat Trip Part 1  James/RaR - Aug 08, 2013 - James fishing.mkv',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Boat Trip Part 1: James fishing',
      sources: ['RaR'],
      artists: ['James'],
      galleryIndex: 1,
      partialDate: [2013, 8, 8],
    },
  },
  {
    data: {
      path: "16e5h3h [POGGERS] Wonderful weather today ain't it... [id=jjh8om] [author=kaleighb1988].jpg",
    },
    result: {
      category: MetadataCategory.Generic,
      title: "[POGGERS] Wonderful weather today ain't it...",
      artists: ['kaleighb1988'],
      contentIds: ['16e5h3h'],
    },
  },
  {
    data: { path: '15b7d4g Hai (✿^‿^) [id=15b7d4g] [author=Joeyniles9].jpg' },
    result: {
      category: MetadataCategory.Generic,
      title: 'Hai (✿^‿^)',
      artists: ['Joeyniles9'],
      contentIds: ['15b7d4g'],
    },
  },
  {
    data: { path: '/data/e/2/7a0df13c3583b62aaf04322063dba4.png' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['e27a0df13c3583b62aaf04322063dba4'],
    },
  },
  {
    data: {
      path: '/media/uploads/5/a0f3183d30a823880175fb95e0933e6.WEBP',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['5a0f3183d30a823880175fb95e0933e6'],
    },
  },
  {
    data: {
      path: '/Users/james/Photos/febfa7d244ae5c855209b86183449f2a.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['febfa7d244ae5c855209b86183449f2a'],
    },
  },
  {
    data: { path: 'IMG_20230722_221114662.jpg' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['221114662'],
      partialDate: [2023, 7, 22],
    },
  },
  {
    data: { path: 'sample_db38780594f27173a0ac4e7ae659cf0d.jpg' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['db38780594f27173a0ac4e7ae659cf0d'],
    },
  },
  {
    data: { path: '5b30d446ce3cd777b631ac6d9da247be.webp' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['5b30d446ce3cd777b631ac6d9da247be'],
    },
  },
  {
    data: {
      path: '/media/tv/Avatar - The Last Airbender (2005) {imdb-tt0417299}/Season 3/Avatar - The Last Airbender (2005) - S03E03 - The Painted Lady [Bluray-1080p][AAC 2.0][x265].mkv',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'The Painted Lady',
      seasonNumber: 3,
      episodeNumbers: [3],
      series: {
        title: 'Avatar - The Last Airbender',
        year: 2005,
        imdbId: 'tt0417299',
      },
    },
  },
  {
    data: { path: '/photos/1978/David Sax January 1972 Atwell.JPG' },
    result: {
      title: 'David Sax January 1972 Atwell',
      category: MetadataCategory.Generic,
      artists: ['David Sax'],
      partialDate: [1972, null, null],
    },
  },
  {
    data: {
      path: '/downloads/complete/[ttv] Shane Smith - Gamer Guy Plays VR Headset Game_2160p.mkv',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Gamer Guy Plays VR Headset Game',
      artists: ['Shane Smith'],
      sources: ['ttv'],
    },
  },
  {
    data: {
      path: 'youtube.com_2752124_big_purple_dinosaur_breakdancing_720p.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'big purple dinosaur breakdancing',
      sources: ['youtube.com'],
      contentIds: ['2752124'],
    },
  },
  {
    data: {
      path: 'Ethan Turner (eturner)/[YouTube] ETurner - 10 Hilarious Cat Fails Caught on Camera (21.08.2023) lq.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      artists: ['Ethan Turner', 'eturner'],
      title: '10 Hilarious Cat Fails Caught on Camera',
      sources: ['YouTube'],
      partialDate: [2023, 8, 21],
    },
  },
  {
    data: {
      path: 'Alice ___Happy New Year 2023_____Brighton_Video_RZ7Czr9KlEk.flv',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Happy New Year 2023',
      artists: ['Alice'],
      contentIds: ['RZ7Czr9KlEk'],
      locationName: 'Brighton',
      partialDate: [2023, null, null],
    },
  },
  {
    data: {
      path: '/personal/family/photos/Photos by year/2006/Cathryn, Logan & Elijah at lake 4.png',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Cathryn, Logan & Elijah at lake',
      artists: ['Cathryn', 'Logan', 'Elijah'],
      partialDate: [2006, null, null],
    },
  },
  {
    data: {
      path: 'ytube_216922_bouncy_red_ball_rolling_around_in_slowmo_hd.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'bouncy red ball rolling around in slowmo',
      sources: ['ytube'],
      contentIds: ['216922'],
    },
  },
  {
    data: { path: 'The Lord smites Thrall [9415632].webm' },
    result: {
      category: MetadataCategory.Generic,
      title: 'The Lord smites Thrall',
      contentIds: ['9415632'],
    },
  },
  {
    data: { path: '009082542ce8d3439a2d86191ff450b1.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: '009082542ce8d3439a2d86191ff450b1',
      contentIds: ['009082542ce8d3439a2d86191ff450b1'],
    },
  },
  {
    data: { path: 'sellyourcomputer/1295406118.mp4' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      artists: ['sellyourcomputer'],
      contentIds: ['1295406118'],
    },
  },
  {
    data: { path: 'redgifs_warpedbitesizedfluke' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['warpedbitesizedfluke'],
      sources: ['redgifs'],
    },
  },
  {
    data: { path: 'redgifs_tatteredalivedragonfly' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['tatteredalivedragonfly'],
      sources: ['redgifs'],
    },
  },
  {
    data: { path: 'gallery-dl/redgifs/redgifs_pastelgoodnaturedasiaticmouflon' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['pastelgoodnaturedasiaticmouflon'],
      sources: ['redgifs'],
    },
  },
  {
    data: { path: 'videos/redgifs_defenselessstiffasiaticgreaterfreshwaterclam' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['defenselessstiffasiaticgreaterfreshwaterclam'],
      sources: ['redgifs'],
    },
  },
  {
    data: { path: 'gfycat_KnobbyNauticalKingfisher' },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['KnobbyNauticalKingfisher'],
      sources: ['gfycat'],
    },
  },
  {
    data: {
      path: 'Blook/reddit/u_blookstan/1649vh1 Watch this building get it’s roof torn off.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      artists: ['Blook', 'u_blookstan'],
      title: 'Watch this building get it’s roof torn off',
      contentIds: ['1649vh1'],
      sources: ['reddit'],
    },
  },
  {
    data: {
      path: 'media/Andor (2022)/Season 1/Andor (2022) - S01E02 - That Would Be Me [DSNP WEBDL-1080p][EAC3 Atmos 5.1][x265]-t3nzin.mkv',
    },
    result: {
      category: MetadataCategory.TVEpisode,
      episodeName: 'That Would Be Me',
      episodeNumbers: [2],
      seasonNumber: 1,
      series: {
        title: 'Andor',
        year: 2022,
      },
    },
  },
  {
    data: {
      path: '1664034648639549442_1.png',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['1664034648639549442'],
      galleryIndex: 1,
    },
  },
  {
    data: {
      path: 'cute/0ty2ibuzt4x42.JPEG',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['0ty2ibuzt4x42'],
    },
  },
  {
    data: {
      path: 'cute/femboy-speech-bubble.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'femboy speech bubble',
    },
  },
  {
    data: {
      path: 'cute/✨ Rym 💕 - Gay thoughts. Send tweet. [1587536267293630471].mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      artists: ['✨ Rym 💕'],
      contentIds: ['1587536267293630471'],
      title: 'Gay thoughts. Send tweet.',
    },
  },
  {
    data: {
      path: 'IMG_1037.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
    },
  },
  {
    data: {
      path: 'fairshot98/reddit/homelab/16fzsz5 02 22 days until the giveaway ends.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      artists: ['fairshot98'],
      contentIds: ['16fzsz5'],
      galleryIndex: 2,
      sources: ['reddit', 'homelab'],
      title: '22 days until the giveaway ends',
    },
  },
  {
    data: {
      path: 'meisnick/reddit/DataHoarder/15zthwi 01 So were doing multi-drive rip rigs: 14 Drives ~180 CDs/Hour.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      artists: ['meisnick'],
      contentIds: ['15zthwi'],
      galleryIndex: 1,
      sources: ['reddit', 'DataHoarder'],
      title: 'So were doing multi-drive rip rigs: 14 Drives ~180 CDs/Hour',
    },
  },
  {
    data: {
      path: 'Daddy UwU~♡ [xno4eeijeyy91].mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      contentIds: ['xno4eeijeyy91'],
      title: 'Daddy UwU~♡',
    },
  },
  {
    data: {
      path: '55dxwqy2mvv42_upscayl_4x_realesrgan-x4plus',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['55dxwqy2mvv42'],
    },
  },
  {
    data: {
      path: 'IMG_1038.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
    },
  },
  {
    data: {
      path: 'Rym/IMG_1018.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      artists: ['Rym'],
    },
  },
  {
    data: {
      path: 'american wrestler/RTO2v4BBuTeaYdD.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      artists: ['american wrestler'],
      contentIds: ['RTO2v4BBuTeaYdD'],
    },
  },
  {
    data: {
      path: 'Ruddle/bt36zz.mov',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      artists: ['Ruddle'],
      contentIds: ['bt36zz'],
    },
  },
  {
    data: {
      path: '2021-02-08 - [FREE] [OHIO] Supermicro 8-bay storage server - 2 Intel CPU, 32GB RAM, 8X LFF Bays.png',
    },
    result: {
      category: MetadataCategory.Generic,
      title: '[FREE] [OHIO] Supermicro 8-bay storage server - 2 Intel CPU, 32GB RAM, 8X LFF Bays',
      locationName: 'OHIO',
      partialDate: [2021, 2, 8],
    },
  },
  {
    data: {
      path: '2021-02-03 Looking for a discord kitten [Kelseyville, CA - 43m] I will buy you nitro!! [id=v7i03n] [galleryIndex=6] [author=Pyrocynical] [subreddit=egirlsanonymous].jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Looking for a discord kitten [Kelseyville, CA - 43m] I will buy you nitro!!',
      locationName: 'Kelseyville, CA',
      partialDate: [2021, 2, 3],
      contentIds: ['v7i03n'],
      galleryIndex: 6,
      artists: ['Pyrocynical'],
      sources: ['egirlsanonymous'],
    },
  },
  {
    data: {
      path: 'lq0rd7B-_500x500.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['lq0rd7B'],
    },
  },
  {
    data: {
      path: '1702725189979517009_1.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['1702725189979517009'],
      galleryIndex: 1,
    },
  },
  {
    data: {
      path: '1567896003214249985_1.jpeg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['1567896003214249985'],
      galleryIndex: 1,
    },
  },
  {
    data: {
      path: 'avatars/-xnfsS3WDdUAliCkwEatDUJUzqrahllbHZAlQk77juU.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['xnfsS3WDdUAliCkwEatDUJUzqrahllbHZAlQk77juU'],
    },
  },
  {
    data: {
      path: '2022-01-03 25m rock band guitarist looking for collaborators. DM me on Discord at RockstarGuitarist89! [id=8wn51z] [galleryIndex=2] [author=GuitarLegend89] [subreddit=MusicLovers].jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title:
        '25m rock band guitarist looking for collaborators. DM me on Discord at RockstarGuitarist89!',
      partialDate: [2022, 1, 3],
      artists: ['GuitarLegend89', 'RockstarGuitarist89'],
      contentIds: ['8wn51z'],
      sources: ['MusicLovers'],
      galleryIndex: 2,
    },
  },
  {
    data: {
      path: 'Person A Dressing Up as a Playful Anime Character in Colorful Costume at a Cosplay Convention_LovelyNeko_1080p.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title:
        'Person A Dressing Up as a Playful Anime Character in Colorful Costume at a Cosplay Convention',
      artists: ['LovelyNeko'],
    },
  },
  {
    data: {
      path: 'Snapchat-823619496.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['823619496'],
      sources: ['Snapchat'],
    },
  },
  {
    data: {
      path: '303029131_Got a new toy from @RandomInventions on twitter c__05_a1622a69-3668-4db3-a4d7-f62cf5c3126e.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      contentIds: ['303029131', 'a1622a69-3668-4db3-a4d7-f62cf5c3126e'],
      galleryIndex: 5,
      title: 'Got a new toy from @RandomInventions on twitter',
      sources: [],
    },
  },
  {
    data: {
      path: '346327617_The Unicorn Squad _3 Thanks for 90K Subscribers on TikTok, I .._28_15e28700-4a1f-c491-8a7a-0e1802f076f4.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      contentIds: ['346327617', '15e28700-4a1f-c491-8a7a-0e1802f076f4'],
      galleryIndex: 28,
      title: 'The Unicorn Squad :3 Thanks for 90K Subscribers on TikTok, I ..',
    },
  },
  {
    data: {
      path: "s45nq6 https___twitter.com_ItsJustAnotherDay Check out my new Twitter account! I've shared some incredible updates. Be sure to follow me there too..png",
    },
    result: {
      category: MetadataCategory.Generic,
      contentIds: ['s45nq6'],
      artists: ['ItsJustAnotherDay'],
      sources: [],
      title:
        "Check out my new Twitter account! I've shared some incredible updates. Be sure to follow me there too.",
    },
  },
  {
    data: {
      path: 'twitter_20210506_173614.mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['173614'],
      sources: ['twitter'],
      partialDate: [2021, 5, 6],
    },
  },
  {
    data: {
      path: '2021-11-08 wow imagine being a Twitter user rn. thank you for still supporting me here my beanie wearing music crew. [id=q4z6yy] [author=AnonymousKawaii].jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title:
        'wow imagine being a Twitter user rn. thank you for still supporting me here my beanie wearing music crew.',
      contentIds: ['q4z6yy'],
      artists: ['AnonymousKawaii'],
    },
  },
  {
    data: {
      path: "z0456q Hey everyone, it's my special day! Send 3.89 to my cashapp ($CosmicWanderer21) to get a YouTube link to birthday party fun, all with music! It's a total of 12min45sec..jpg",
    },
    result: {
      category: MetadataCategory.Generic,
      title:
        "Hey everyone, it's my special day! Send 3.89 to my cashapp ($CosmicWanderer21) to get a YouTube link to birthday party fun, all with music! It's a total of 12min45sec.",
      contentIds: ['z0456q'],
      artists: ['CosmicWanderer21'],
    },
  },
  {
    data: {
      path: 'people/Ashley Parks/Pics/MV5BODExNjlhYTktM2Q2OC00Mzc0LWI4YjItOTlmOTM4MDY5Mjk4XkEyXkFqcGdeQXVyMjY1MjkzMjE@._V1_UY1200_CR165,0,630,1200_AL_.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      artists: ['Ashley Parks'],
      contentIds: [
        'MV5BODExNjlhYTktM2Q2OC00Mzc0LWI4YjItOTlmOTM4MDY5Mjk4XkEyXkFqcGdeQXVyMjY1MjkzMjE',
      ],
    },
  },
  {
    data: {
      path: 'Ahegao_Makeup_Tutorial_Belle_Delphine_Instagram_Pics_43.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      artists: ['Belle Delphine'],
      title: 'Ahegao Makeup Tutorial',
      galleryIndex: 43,
    },
  },
  {
    data: {
      path: 'perth trip/DCIM/PICT0002.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
    },
  },
  {
    data: {
      path: 'Adventurer seeks thrilling quests, so they embark on an epic journey, brave [48104292].mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Adventurer seeks thrilling quests, so they embark on an epic journey, brave',
      contentIds: ['48104292'],
    },
  },
  {
    data: {
      path: 'reddit_jv3x8p91ak7lvqg5ne7_720.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: null,
      contentIds: ['jv3x8p91ak7lvqg5ne7'],
      sources: ['reddit'],
    },
  },
  {
    data: {
      path: 'Bound For Adventure - Sven Peterson, Diego, Bryce Fenton, Max Collins, Ryan Butler, and Jake (90288).mkv',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Bound For Adventure',
      artists: ['Sven Peterson', 'Diego', 'Bryce Fenton', 'Max Collins', 'Ryan Butler', 'Jake'],
      contentIds: ['90288'],
    },
  },
  {
    data: {
      path: 'Lana Rhoades & Logan Paul - Beach Bonanza (03-12-2020) 720p.mkv',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Beach Bonanza',
      artists: ['Lana Rhoades', 'Logan Paul'],
      partialDate: [2020, 12, 3],
    },
  },
  {
    data: {
      path: 'fsb-324814-Space_adventure_pixelart_static_image_full_link_in_description.gif',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Space adventure pixelart static image full link in description',
      contentIds: ['324814'],
      artists: ['fsb'],
    },
  },
  {
    data: {
      path: 's2gtjo 02 ☺️ Charming lil lizard ☺️.jpg',
    },
    result: {
      category: MetadataCategory.Generic,
      title: '☺️ Charming lil lizard ☺️',
      contentIds: ['s2gtjo'],
      galleryIndex: 2,
    },
  },
  {
    data: {
      path: 'videos/Party Time (incomplete) (rainbow) (corrupt) (sR8M4zARBXY).mp4',
    },
    result: {
      category: MetadataCategory.Generic,
      title: 'Party Time (incomplete) (rainbow) (corrupt)',
      contentIds: ['sR8M4zARBXY'],
    },
  },
];
