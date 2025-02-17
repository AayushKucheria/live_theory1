import React, { useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { generateModeLabels } from '../services/interfaceGenerator';

const QuickButton = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-8 py-6 rounded-2xl text-base font-medium transition-all duration-300
      min-h-[96px] w-full flex items-center justify-center
      ${selected 
        ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500' 
        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
      }
    `}
  >
    <span className="text-center transition-opacity duration-300 leading-relaxed">
      {label}
    </span>
  </button>
);

const CreatorOption = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-3 rounded-xl text-base transition-all
      ${selected 
        ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500' 
        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
      }
    `}
  >
    {label}
  </button>
);

const modeVariations = {
  reflection: [
    "Let's process how you're feeling",
    "Take a mindful pause",
    "Find clarity in this moment",
    "Gentle space to reflect",
    "Unwind your thoughts"
  ],
  planning: [
    "Small steps forward",
    "Let's break this down",
    "Find your next move",
    "Shape your path ahead",
    "Organize with ease"
  ],
  capture: [
    "Just get it down",
    "Quick thoughts, no pressure",
    "Save it for later",
    "Let it flow freely",
    "Catch those ideas"
  ]
};

const creatorStyles = {
  minimalist: {
    background: `bg-slate-50 [background-image:linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%,#f1f5f9)] bg-[length:16px_16px]`,
    text: 'text-slate-700',
    hover: 'hover:bg-slate-100',
    selected: 'ring-2 ring-slate-400 bg-white shadow-sm',
    icon: '•'
  },
  creative: {
    background: 'bg-gradient-to-br from-purple-50 to-blue-50',
    text: 'text-purple-700',
    hover: 'hover:bg-white/50',
    selected: 'ring-2 ring-purple-400 bg-white/80 shadow-sm',
    icon: '✨'
  },
  knowledge: {
    background: 'bg-blue-50 [background-image:linear-gradient(white_2px,transparent_2px),linear-gradient(90deg,white_2px,transparent_2px)] bg-[size:32px_32px]',
    text: 'text-blue-700',
    hover: 'hover:bg-white/50',
    selected: 'ring-2 ring-blue-400 bg-white/80 shadow-sm',
    icon: '→'
  }
};

const StyleButton = ({ style, selected, onClick }) => {
  const styleConfig = {
    minimalist: {
      ...creatorStyles.minimalist,
      label: 'Minimalism',
      creator: 'Jun Tanaka',
      description: 'Digital Zen Garden'
    },
    creative: {
      ...creatorStyles.creative,
      label: 'Creative Flow',
      creator: 'Luna Martinez',
      description: 'Your Creative Companion'
    },
    knowledge: {
      ...creatorStyles.knowledge,
      label: 'Knowledge Architecture',
      creator: 'Marcus Chen',
      description: 'Structured Thinking'
    }
  }[style];

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-xl transition-all duration-200
        ${styleConfig.background}
        ${selected ? styleConfig.selected : styleConfig.hover}
        group relative overflow-hidden
      `}
    >
      <div className="relative z-10 flex items-start space-x-3">
        <span className="text-2xl">{styleConfig.icon}</span>
        <div className="text-left">
          <div className={`font-medium ${styleConfig.text}`}>
            {styleConfig.label}
          </div>
          <div className="text-sm opacity-75 mt-1">
            {styleConfig.description}
          </div>
          <div className="text-xs mt-2 opacity-60">
            by {styleConfig.creator}
          </div>
        </div>
      </div>
    </button>
  );
};

const PreferencesDialog = ({ onComplete }) => {
  const [preferences, setPreferences] = useState({
    intention: '',
    mode: '',
    creators: new Set(),
    modeLabels: {
      reflection: "Reflection",
      planning: "Planning",
      capture: "Quick Capture"
    }
  });

  const creators = [
    { id: 'minimalist', name: 'Minimalism', creator: 'jun' },
    { id: 'creative', name: 'Creative Flow', creator: 'luna' },
    { id: 'structured', name: 'Knowledge Architecture', creator: 'marcus' }
  ];

  useEffect(() => {
    const processIntention = debounce(async (text) => {
      if (text.length < 15) return;

      try {
        const aiLabels = await generateModeLabels(text);
        if (aiLabels) {
          setPreferences(prev => ({
            ...prev,
            modeLabels: aiLabels
          }));
        }
      } catch (error) {
        console.error('Error generating AI labels:', error);
      }
    }, 600);

    processIntention(preferences.intention);
    return () => processIntention.cancel();
  }, [preferences.intention]);

  const modes = [
    { id: 'reflection', label: preferences.modeLabels.reflection },
    { id: 'planning', label: preferences.modeLabels.planning },
    { id: 'capture', label: preferences.modeLabels.capture }
  ];

  const handleSave = () => {
    const mappedPreferences = {
      purpose: preferences.mode.toLowerCase(),
      style: preferences.creators,
      additionalContext: preferences.intention
    };
    onComplete(mappedPreferences);
  };

  const styleButtonProps = (style) => ({
    selected: preferences.creators.has(style),
    onClick: () => setPreferences(prev => {
      const newCreators = new Set(prev.creators);
      if (newCreators.has(style)) {
        newCreators.delete(style);
      } else {
        newCreators.add(style);
      }
      return { ...prev, creators: newCreators };
    })
  });

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full h-full p-6 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-[1000px] h-[85vh] flex flex-col">
          <div className="p-8 flex flex-col h-full">
            <div className="space-y-2">
              <h2 className="text-3xl font-medium text-slate-800">
                Plant the seed of your idea
              </h2>
              <p className="text-slate-600 text-lg max-w-3xl">
                We'll grow an interface that resonates with your intention, combining elements from our creators' gardens.
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-8 mt-6 min-h-0">
              <div className="flex gap-8 flex-1">
                <div className="flex-1">
                  <div className="bg-slate-50/70 p-6 rounded-3xl h-full flex flex-col">
                    <textarea
                      value={preferences.intention}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        intention: e.target.value
                      }))}
                      placeholder="What's on your mind? How are you feeling? Let's find the right space for your thoughts..."
                      className="w-full flex-1 p-5 text-base bg-white rounded-2xl 
                               border-none focus:ring-2 focus:ring-emerald-500
                               placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 min-w-[320px]">
                  {modes.map(({ id, label }) => (
                    <QuickButton
                      key={id}
                      label={label}
                      selected={preferences.mode === id}
                      onClick={() => setPreferences(prev => ({
                        ...prev,
                        mode: id
                      }))}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-600 text-base mb-4">Choose your garden's style:</p>
                <div className="grid grid-cols-3 gap-4">
                  <StyleButton style="minimalist" {...styleButtonProps('minimalist')} />
                  <StyleButton style="creative" {...styleButtonProps('creative')} />
                  <StyleButton style="knowledge" {...styleButtonProps('structured')} />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                className="px-10 py-3 bg-emerald-500 text-white text-lg rounded-xl
                         hover:bg-emerald-600 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesDialog; 