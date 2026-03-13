import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Button } from '../components/UI';
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export default function LogoEnhancer() {
  const [status, setStatus] = useState<'idle' | 'generating' | 'saving' | 'success' | 'error'>('idle');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateLogo = async () => {
    setStatus('generating');
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = "A ultra-luxurious 3D gold logo for 'Princess Travel Consult'. The logo features a majestic eagle head facing left, wearing a royal crown. The eagle's neck flows into elegant, stylized golden wings. The texture is polished, reflective 3D gold with realistic lighting and shadows. The background is a deep, textured charcoal black. Professional branding, 4k resolution, high contrast, elegant serif typography for 'PRINCESS' and clean sans-serif for 'TRAVEL CONSULT'.";
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
      });

      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setGeneratedImage(imageUrl);
        setStatus('idle');
      } else {
        throw new Error("No image was generated. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate logo");
      setStatus('error');
    }
  };

  const saveLogo = async () => {
    if (!generatedImage) return;
    setStatus('saving');
    try {
      const response = await fetch('/api/admin/save-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: generatedImage }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        throw new Error("Failed to save logo to server");
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="pt-32 min-h-screen px-6">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="text-deep-black w-10 h-10" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-4">AI Logo Enhancer</h1>
          <p className="text-white/60 mb-12 max-w-xl mx-auto">
            Use the power of Gemini to generate a high-definition, luxurious version of your logo. 
            Once generated, you can save it directly to your website.
          </p>

          <div className="flex justify-center gap-6 mb-12">
            <Button 
              onClick={generateLogo} 
              disabled={status === 'generating' || status === 'saving'}
              className="min-w-[200px]"
            >
              {status === 'generating' ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              {generatedImage ? "Regenerate Logo" : "Generate Enhanced Logo"}
            </Button>
            
            {generatedImage && (
              <Button 
                variant="outline" 
                onClick={saveLogo} 
                disabled={status === 'saving'}
                className="min-w-[200px]"
              >
                {status === 'saving' ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                Apply to Website
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 flex items-center justify-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl mb-8 flex items-center justify-center gap-3">
              <CheckCircle size={20} />
              Logo successfully enhanced and applied! Refresh the page to see changes.
            </div>
          )}

          {generatedImage && (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-widest text-white/30 mb-4">Preview</p>
              <div className="relative group inline-block">
                <img 
                  src={generatedImage} 
                  alt="Enhanced Logo Preview" 
                  className="max-w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <p className="text-white font-bold">Generated by Gemini</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
