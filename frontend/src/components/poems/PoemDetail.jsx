import React, { useState, useCallback, useEffect } from 'react';
import { 
  Eye, Heart, Clock, Tag, Share2, Link as LinkIcon, MessageSquare 
} from 'lucide-react';

/**
 * Poem Detail View Component
 * Designed to be used inside a Modal for detailed poem reading experience.
 */
const PoemDetail = ({ currentPoem, t }) => {
  const poemId = currentPoem?._id;
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!poemId) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`poemComments:${poemId}`) || '[]');
      setComments(Array.isArray(saved) ? saved : []);
      const likedFlag = localStorage.getItem(`poemLiked:${poemId}`) === 'true';
      setLiked(likedFlag);
    } catch (_err) {
      // Error handling
    }
  }, [poemId]);

  const handleShare = useCallback(async () => {
    if (!currentPoem) return;
    try {
      const shareData = {
        title: currentPoem.title,
        text: currentPoem.excerpt || currentPoem.title,
        url: window.location.href
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (_err) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (_ignore) {
        // Ignore second failure
      }
    }
  }, [currentPoem]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_err) {
      // Error handling
    }
  }, []);

  const postComment = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    const next = [{ id: Date.now(), text }, ...comments];
    setComments(next);
    try {
      if (poemId) localStorage.setItem(`poemComments:${poemId}`, JSON.stringify(next));
    } catch (_err) {
      // Error handling
    }
    setDraft('');
  }, [draft, comments, poemId]);

  const toggleLike = useCallback(() => {
    const next = !liked;
    setLiked(next);
    try {
      if (poemId) localStorage.setItem(`poemLiked:${poemId}`, String(next));
    } catch (_err) {
      // Error handling
    }
  }, [liked, poemId]);

  if (!currentPoem) return null;

  const displayLikes = (currentPoem.likes || 0) + (liked ? 1 : 0);

  return (
    <div className="poem-detail-layout">
      <div className="poem-visuals">
        <div className="main-image-box">
          <img
            src={currentPoem.imageUrl}
            alt={currentPoem.title}
            width={1200}
            height={800}
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="poem-meta-stats">
          <div className="poem-meta-item"><Eye size={18}/> {currentPoem.views} {t('common.views')}</div>
          <div className="poem-meta-item"><Heart size={18}/> {currentPoem.likes} {t('common.likes')}</div>
          <div className="poem-meta-item"><Clock size={18}/> {currentPoem.readingTime} {t('poems.reading-time')}</div>
        </div>
      </div>

      <div className="poem-info">
        <article className="poem-content-section">

          <div className="poem-text-content">
            {(currentPoem.content || '').split('\n').map((line, index) => (
              <p key={index} className="poem-line">{line || <br />}</p>
            ))}
          </div>
        </article>

        {currentPoem.tags?.length > 0 && (
          <div className="poem-tags-section">
            <h4 className="section-heading"><Tag size={16}/> {t('skills.tags')}</h4>
            <div className="poem-tag-list">
              {currentPoem.tags.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          </div>
        )}

        <section className="poem-comment-section">
          <div className="poem-share-bar">
            <div className="left-tools">
              <button className="btn btn-secondary" onClick={handleShare} aria-label={t('common.share')}>
                <Share2 size={16}/> {copied ? t('common.link-copied') : t('common.share')}
              </button>
            </div>
            <button
              className={`btn btn-secondary poem-like-btn${liked ? ' active' : ''}`}
              onClick={toggleLike}
              aria-pressed={liked}
              aria-label={t('common.likes')}
            >
              <Heart size={16} /> {displayLikes}
            </button>
          </div>
          <h3 className="section-heading"><MessageSquare size={16}/> {t('common.comments')}</h3>
          <div className="comment-form">
            <textarea
              className="comment-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('common.add-comment')}
              rows={3}
            />
            <button className="btn btn-primary comment-submit" onClick={postComment}>
              {t('common.post-comment')}
            </button>
          </div>
          {comments.length > 0 && (
            <ul className="comment-list">
              {comments.map(c => (
                <li key={c.id} className="comment-item">{c.text}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default PoemDetail;
