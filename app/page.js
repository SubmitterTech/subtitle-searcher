'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import embeddedSubtitles from '../utils/subtitles.json';
import embeddedVideoData from '../utils/video-data.json';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [subtitles, setSubtitles] = useState([]);
  const [videoData, setVideoData] = useState({});
  const [loading, setLoading] = useState(true);

  const [loadedResults, setLoadedResults] = useState([]);
  const [searchResults, setSearchResults] = useState([]);


  const batchSize = 9;
  const observerRef = useRef(null);

  const performSearch = useCallback((term) => {
    if (!term) {
      return;
    }
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = subtitles.filter((sub) =>
      sub.text.toLocaleLowerCase('tr').includes(term.toLocaleLowerCase('tr'))
    );
    setSearchResults(results);
  }, [subtitles]);

  const formatTime = (seconds) => {
    const sec = Math.floor(seconds);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? `${h.toString().padStart(2, '0')}:${m
        .toString()
        .padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="text-rose-500">{part}</span>
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    // Flatten embeddedSubtitles (keyed by file number) into an array.
    const flattened = Object.entries(embeddedSubtitles).flatMap(([fileKey, subs]) =>
      subs.map((sub) => ({ ...sub, file: fileKey }))
    );
    setSubtitles(flattened);
    setVideoData(embeddedVideoData);
    setLoading(false);
  }, []);

  const lastSubtitleElementRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && loadedResults.length < searchResults.length) {
        setLoadedResults(prevLoaded => [
          ...prevLoaded,
          ...searchResults.slice(prevLoaded.length, prevLoaded.length + batchSize)
        ]);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [searchResults, loadedResults]);


  const handleSubtitleClick = (sub) => {
    const fileNumber = sub.file;
    const videoInfo = videoData[fileNumber];
    if (videoInfo && videoInfo.videoId) {
      const url = `https://www.youtube.com/watch?v=${videoInfo.videoId}&t=${Math.floor(
        sub.startTime
      )}s`;
      window.open(url, '_blank');
    } else {
      console.error('No video data found for file:', sub.file);
    }
  };


  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setLoadedResults(searchResults.slice(0, batchSize));
  }, [searchResults]);


  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-xl font-semibold">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="h-screen fixed w-screen bg-gradient-to-r from-sky-500 to-cyan-500 flex flex-col">
      <div className="max-w-4xl relative -translate-x-1/2 left-1/2">
        <div className="p-2 absolute top-0 left-0 right-0 flex space-x-3">
          <div className="w-full h-full relative ">
            <input
              type="text"
              placeholder="Ses kayıtlarında ara..."
              className=" w-full h-full z-20 text-xl md:text-3xl py-2 px-4 bg-neutral-700 rounded-md border border-neutral-400 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-sky-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}

            />
            <div className="absolute top-1 bottom-1 right-1 z-30 text-2xl md:text-4xl bg-neutral-700 text-sky-500 p-3 flex items-center justify-center">
              {searchResults.length > 0 && searchResults.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto rounded shadow-l h-full mt-16 md:mt-20 pb-20">
        <div className="h-full overflow-y-auto p-3 pb-6">
          {searchTerm.trim() === '' ? (
            <div className="text-center text-neutral-700">Lütfen aramak istediğiniz kelimeyi giriniz.</div>
          ) : loadedResults.length > 0 ? (
            <div className="flex flex-col space-y-5">
              {loadedResults.map((result, index) => {
                const fileNumber = result.file;
                const videoInfo = videoData[fileNumber];
                return (
                  <div
                    ref={(node) => {
                      if (index === loadedResults.length - 1) {
                        lastSubtitleElementRef(node);
                      }
                    }}
                    key={`${fileNumber}-${index}`}
                    className=" bg-neutral-50 rounded-md shadow-lg shadow-neutral-600/50 overflow-hidden"
                    onClick={() => handleSubtitleClick(result)}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="flex flex-col grow w-full">
                        {videoInfo?.title ? (
                          <div className="flex px-2 pt-2 cursor-pointer select-none">
                            <div className="text-sm text-black font-semibold">
                              {videoInfo.title}
                            </div>
                          </div>

                        ) : (<div className="text-md text-rose-400 ">{`Video başlığı çekilemedi...`}</div>)}
                        <div className="flex flex-col grow p-2">
                          <div className="text-sm text-sky-600">
                            [{formatTime(result.startTime)} - {formatTime(result.endTime)}]
                          </div>
                          <div className=" text-neutral-800 select-text">
                            {highlightText(result.text, searchTerm)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );

              })}
            </div>
          ) : (
            <div className="text-center text-neutral-700 text-lg ">Sonuç bulunamadı.</div>
          )}
        </div>
      </div>
    </div>
  );
}
