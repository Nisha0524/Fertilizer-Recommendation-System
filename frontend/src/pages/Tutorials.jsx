import React from 'react';
import './Tutorials.css';

const Tutorials = () => {
  const videos = [
    {
      id: 'coconut-organic-fertilizer',
      title: 'Coconut Tree Organic Fertilizer (Tamil)',
      description: 'Step-by-step organic fertilizer schedule for coconut trees shared by THE CROPS GARDEN.',
      videoUrl: 'https://youtu.be/OSqtWgf0N8g?si=yz2iaplo-tLhc2lv',
      language: 'Tamil',
      duration: '05:02',
      channel: 'THE CROPS GARDEN'
    },
    {
      id: 'homemade-organic-fertilizer-1',
      title: 'Zero Cost Homemade Organic Fertilizers (Tamil)',
      description: 'Pasumaiveedu Organic Garden shows five no-cost fertilizer recipes for all plants.',
      videoUrl: 'https://youtu.be/Ak8Sf8CikvE?si=huH3qRkxwls6x38i',
      language: 'Tamil',
      duration: '10:41',
      channel: 'Pasumaiveedu Organic Garden & Vlog'
    },
    {
      id: 'homemade-organic-fertilizer-2',
      title: 'Homemade Organic Fertilizers (Tamil)',
      description: 'Pasumaiboomi Organic Garden shows homemade organic fertilizer preparation.',
      videoUrl: 'https://youtu.be/7kib-sRBNSg?si=mRvLzWSIrFD0-8Ax',
      language: 'Tamil',
      duration: '09:06',
      channel: 'Vellanmai Vlog'
    },
    {
      id: 'organic-fertilizer-tips',
      title: 'Organic Fertilizers (Tamil)',
      description: 'Daily tips on creating simple organic fertilizers.',
      videoUrl: 'https://youtu.be/Rndz7m4xN6o?si=8ZiefJHz7x84IbpE',
      language: 'Tamil',
      duration: '09:06',
      channel: 'Vellanpedia'
    },

    
    {
      id: 'soil-testing-tutorial',
      title: 'Soil Testing Guide (Tamil)',
      description: 'A clear and practical explanation of how to test soil at home and understand soil nutrients.',
      videoUrl: 'https://youtu.be/Y7A4j2FY_2Q?si=IpXTi69lq0FRq2Tv',
      language: 'Tamil',
      duration: '06:36',
      channel: 'Vellanmai Vivasayam'
    },
    {
      id: 'organic-liquid-fertilizer',
      title: 'Organic Liquid Fertilizer Preparation (Tamil)',
      description: 'Step-by-step preparation of organic liquid fertilizer for all crops, explained in simple Tamil.',
      videoUrl: 'https://youtu.be/-uH9oNhh57U?si=XOfJg0jd1UAPVNhO',
      language: 'Tamil',
      duration: '08:14',
      channel: 'Natural Farming Tamil'
    }
  ];

  const handleWatchVideo = (videoUrl) => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container">
      <div className="tutorials-header">
        <h1>
          <span>📺</span> Video Tutorials
        </h1>
        <p className="tutorials-subtitle">
          Don't worry, if you don't know how to grow crops, Naanga Irukom ⭐!!
          
        </p>
      </div>

      <div className="tutorials-grid">
        {videos.map((video) => (
          <div key={video.id} className="tutorial-card">
            <div className="tutorial-header">
              <div className="language-badge" data-lang={video.language}>
                {video.language === 'Tamil' ? '🇮🇳 தமிழ்' : '🇬🇧 English'}
              </div>
              <div className="duration-badge">⏱️ {video.duration}</div>
            </div>
            <h3 className="tutorial-title">{video.title}</h3>
            <p className="tutorial-description">{video.description}</p>
            <div className="tutorial-category">📺 {video.channel}</div>
            <button
              className="btn-watch-video"
              onClick={() => handleWatchVideo(video.videoUrl)}
            >
              ▶️ Watch on YouTube
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tutorials;
