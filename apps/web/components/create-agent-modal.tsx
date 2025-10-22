'use client';

import * as React from 'react';
import {
  Bot,
  Sparkles,
  Brain,
  BookOpen,
  Calculator,
  Palette,
  Upload,
  X,
  Wand2,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
} from 'lucide-react';
import { db } from '@/lib/instant';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@workspace/ui/components/collapsible';

export interface CustomAgent {
  id: string;
  name: string;
  icon: string;
  personality: string;
  expertise: string;
  systemPrompt: string;
  color: string;
  avatarUrl?: string;
  starterPrompts?: string[];
}

interface CreateAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAgent: (agent: CustomAgent) => void;
}

const AVATAR_OPTIONS = [
  { value: 'bot', label: 'Robot', icon: Bot, description: 'Tech-savvy' },
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles, description: 'Creative' },
  { value: 'brain', label: 'Brain', icon: Brain, description: 'Intelligent' },
  { value: 'book', label: 'Book', icon: BookOpen, description: 'Knowledgeable' },
  { value: 'calculator', label: 'Calculator', icon: Calculator, description: 'Analytical' },
  { value: 'palette', label: 'Palette', icon: Palette, description: 'Artistic' },
];

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Ocean Blue', class: 'bg-gradient-to-br from-blue-400 to-blue-600', textClass: 'text-blue-600' },
  { value: 'purple', label: 'Royal Purple', class: 'bg-gradient-to-br from-purple-400 to-purple-600', textClass: 'text-purple-600' },
  { value: 'green', label: 'Forest Green', class: 'bg-gradient-to-br from-green-400 to-green-600', textClass: 'text-green-600' },
  { value: 'orange', label: 'Sunset Orange', class: 'bg-gradient-to-br from-orange-400 to-orange-600', textClass: 'text-orange-600' },
  { value: 'pink', label: 'Cherry Pink', class: 'bg-gradient-to-br from-pink-400 to-pink-600', textClass: 'text-pink-600' },
  { value: 'teal', label: 'Ocean Teal', class: 'bg-gradient-to-br from-teal-400 to-teal-600', textClass: 'text-teal-600' },
];

export function CreateAgentModal({
  open,
  onOpenChange,
  onCreateAgent,
}: CreateAgentModalProps) {
  const [name, setName] = React.useState('');
  const [icon, setIcon] = React.useState('bot');
  const [personality, setPersonality] = React.useState('');
  const [expertise, setExpertise] = React.useState('');
  const [systemPrompt, setSystemPrompt] = React.useState('');
  const [color, setColor] = React.useState('blue');
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [starterPrompts, setStarterPrompts] = React.useState<string[]>(['', '', '']);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let avatarUrl: string | undefined;

      if (avatarFile) {
        const agentId = `custom-${Date.now()}`;
        const formData = new FormData();
        formData.append('file', avatarFile);
        formData.append('agentId', agentId);

        const uploadResponse = await fetch('/api/upload/avatar', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const uploadResult = await uploadResponse.json();
        avatarUrl = uploadResult.fileId;
      }

      const newAgent: CustomAgent = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        icon,
        personality: personality.trim(),
        expertise: expertise.trim(),
        systemPrompt: systemPrompt.trim(),
        color,
        avatarUrl,
        starterPrompts: starterPrompts.filter(p => p.trim()).map(p => p.trim()),
      };

      onCreateAgent(newAgent);

      // Reset form
      setName('');
      setIcon('bot');
      setPersonality('');
      setExpertise('');
      setSystemPrompt('');
      setColor('blue');
      setAvatarFile(null);
      setAvatarPreview(null);
      setStarterPrompts(['', '', '']);
      setShowAdvanced(false);

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating agent:', error);
      alert(`Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const selectedIcon = AVATAR_OPTIONS.find((opt) => opt.value === icon);
  const IconComponent = selectedIcon?.icon || Bot;
  const selectedColor = COLOR_OPTIONS.find((opt) => opt.value === color);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-muted/20">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4">
            <Wand2 className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Create Your AI Agent
          </DialogTitle>
          <DialogDescription className="text-base">
            Design a personalized AI assistant with unique personality and expertise
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Identity Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-primary" />
                Agent Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Agent Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Agent Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Science Explorer, Code Mentor, Creative Writer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-base h-11"
                />
              </div>

              {/* Expertise */}
              <div className="space-y-2">
                <Label htmlFor="expertise" className="text-sm font-medium">Specialization *</Label>
                <Input
                  id="expertise"
                  placeholder="e.g., Quantum Physics, React Development, Poetry"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  required
                  className="text-base h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Visual Design Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5 text-primary" />
                Visual Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Custom Avatar</Label>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <div className="relative group">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-primary/30 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 flex flex-col items-center justify-center transition-all duration-200 group"
                    >
                      <Upload className="w-6 h-6 text-primary/60 group-hover:text-primary transition-colors" />
                      <span className="text-xs text-primary/60 group-hover:text-primary mt-1">Upload</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Upload a custom avatar image (max 5MB)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, or GIF • Square images work best
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Icon Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Icon Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {AVATAR_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setIcon(option.value)}
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                          icon === option.value
                            ? 'border-primary bg-primary/5 shadow-lg'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-2 rounded-lg transition-colors ${
                            icon === option.value
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted group-hover:bg-primary/5'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                        {icon === option.value && (
                          <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Color Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Theme Color</Label>
                <div className="grid grid-cols-3 gap-3">
                  {COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setColor(option.value)}
                      className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        color === option.value
                          ? 'border-primary shadow-lg'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${option.class} shadow-sm`} />
                        <p className="text-sm font-medium">{option.label}</p>
                      </div>
                      {color === option.value && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personality Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="w-5 h-5 text-primary" />
                Personality & Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Personality */}
              <div className="space-y-2">
                <Label htmlFor="personality" className="text-sm font-medium">Personality Traits</Label>
                <Textarea
                  id="personality"
                  placeholder="e.g., Friendly and patient, uses simple analogies, encourages questions, has a sense of humor"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  rows={3}
                  className="text-base resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Describe how your agent should interact with users
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <Card className="border-2 border-primary/20 shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Advanced Options
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    </div>
                    {showAdvanced ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {/* System Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt" className="text-sm font-medium">Custom Instructions</Label>
                    <Textarea
                      id="systemPrompt"
                      placeholder="e.g., You are an expert quantum physics tutor who specializes in making complex concepts accessible through real-world analogies..."
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      rows={4}
                      className="text-base resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Advanced: Provide specific behavioral instructions for the AI
                    </p>
                  </div>

                  {/* Starter Prompts */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Conversation Starters</Label>
                    <p className="text-xs text-muted-foreground">
                      Suggest helpful prompts to get conversations started (up to 3)
                    </p>
                    {starterPrompts.map((prompt, index) => (
                      <Input
                        key={index}
                        placeholder={`e.g., ${index === 0 ? 'Explain quantum entanglement simply' : index === 1 ? 'What are the main quantum principles?' : 'Help me understand wave-particle duality'}`}
                        value={prompt}
                        onChange={(e) => {
                          const newPrompts = [...starterPrompts];
                          newPrompts[index] = e.target.value;
                          setStarterPrompts(newPrompts);
                        }}
                        className="text-sm"
                      />
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Live Preview Card */}
          <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background/80 border border-primary/20 shadow-inner">
                <div className="flex-shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-14 h-14 rounded-xl object-cover border-2 border-primary/30"
                    />
                  ) : (
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${selectedColor?.class} shadow-md`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {name || 'Your Agent Name'}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {expertise || 'Specialization'}
                  </p>
                  {personality && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {personality}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !expertise.trim() || isUploading}
              className="flex-1 h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Agent...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Create Agent
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
