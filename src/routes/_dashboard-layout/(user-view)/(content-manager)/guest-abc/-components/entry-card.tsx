import { Edit2Icon, Loader2Icon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Item,
  ItemActions,
  ItemDescription,
  ItemHeader,
  ItemTitle
} from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import type { Entry } from './types';

// Fake latency so the save spinner is perceptible.
const SAVE_DELAY_MS = 800;

interface EntryCardProps {
  title: string;
  description: string;
  onUpdate: (entry: Entry) => void;
}

export function EntryCard({ title, description, onUpdate }: EntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDescription, setDraftDescription] = useState(description);

  const startEditing = () => {
    setDraftTitle(title);
    setDraftDescription(description);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    await new Promise(resolve => setTimeout(resolve, SAVE_DELAY_MS));
    onUpdate({
      title: draftTitle.trim(),
      description: draftDescription.trim()
    });
    setIsUpdating(false);
    setIsEditing(false);
  };

  const canSubmit = draftTitle.trim() !== '' && draftDescription.trim() !== '';

  if (isEditing) {
    return (
      <Item variant="outline" className="flex-col items-stretch gap-3 p-4">
        <div className="w-full space-y-2">
          <Label>Title</Label>
          <Input
            value={draftTitle}
            onChange={e => setDraftTitle(e.target.value)}
            disabled={isUpdating}
          />
        </div>
        <div className="w-full space-y-2">
          <Label>Description</Label>
          <Textarea
            value={draftDescription}
            onChange={e => setDraftDescription(e.target.value)}
            rows={4}
            disabled={isUpdating}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={handleUpdate}
            disabled={isUpdating || !canSubmit}
          >
            {isUpdating && <Loader2Icon className="animate-spin" />}
            Update
          </Button>
        </div>
      </Item>
    );
  }

  return (
    <Item variant="outline" className="flex-col items-stretch gap-1.5 p-4">
      <ItemHeader>
        <ItemTitle className="text-base">{title}</ItemTitle>
        <ItemActions className="gap-0.5 opacity-0 transition-opacity group-hover/item:opacity-100 focus-within:opacity-100">
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={startEditing}
          >
            <Edit2Icon className="size-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-muted-foreground"
          >
            <TrashIcon className="size-3.5" />
          </Button>
        </ItemActions>
      </ItemHeader>
      <ItemDescription className="text-[13px]">{description}</ItemDescription>
    </Item>
  );
}

export function EntryCardSkeleton() {
  return (
    <Item variant="muted" className="flex-col items-stretch gap-2 p-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </Item>
  );
}
