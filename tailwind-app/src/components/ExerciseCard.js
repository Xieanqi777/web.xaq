"use client";
import React, { useState } from "react";

export default function ExerciseCard({
  title,
  description,
  imageUrl,
  link,
  tags,
}) {
  const [isFavorited, setIsFavorited] = useState(false);
  
  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };
  
  return (
    <div className="horizontal-card bg-white overflow-hidden border-l-4 border-[var(--morandiPurple)]">
      <div className="flex flex-col md:flex-row h-full">
        <div className="md:w-2/5 relative">
          <img
            className="w-full h-48 md:h-full object-cover"
            src={imageUrl}
            alt={title || "Exercise Image"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
        </div>
        
        <div className="md:w-3/5 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[var(--morandiDarkPurple)] mb-2">
              {title || "练习标题"}
            </h3>
            <p className="text-[var(--morandiPurple)] text-sm mb-4 leading-relaxed">
              {description || "这里是练习的简要描述，介绍练习的主要内容和目标。"}
            </p>
            
            {tags && tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="horizontal-tag bg-[var(--morandiLightPurple)]/10 text-[var(--morandiDarkPurple)] font-medium border border-[var(--morandiLightPurple)]/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="horizontal-btn bg-[var(--morandiPurple)] text-white font-medium hover:bg-[var(--morandiDarkPurple)]"
              >
                查看练习
              </a>
            ) : (
              <p className="text-sm text-[var(--morandiGray)]">暂无在线链接</p>
            )}
            <button
              onClick={handleToggleFavorite}
              className={`horizontal-btn font-medium text-sm
                          ${
                            isFavorited
                              ? "bg-[var(--morandiPink)] text-white" 
                              : "bg-[var(--morandiGray)]/20 text-[var(--morandiDarkPurple)]" 
                          }`}
            >
              {isFavorited ? "已收藏 ★" : "收藏 ☆"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
