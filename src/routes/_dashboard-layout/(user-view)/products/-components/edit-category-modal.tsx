import * as React from 'react';

import { Trans } from '@lingui/react/macro';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditCategoryModalProps {
  open: boolean;
  initialTitle: string;
  onOpenChange: (open: boolean) => void;
  onSave: (newTitle: string) => void;
}

export function EditCategoryModal({
  open,
  initialTitle,
  onOpenChange,
  onSave
}: EditCategoryModalProps) {
  const [title, setTitle] = React.useState(initialTitle);

  React.useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Edit category</Trans>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="category-title">
            <Trans>Category name</Trans>
          </Label>
          <Input
            id="category-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <Trans>Cancel</Trans>
          </Button>
          <Button onClick={() => onSave(title)}>
            <Trans>Save</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
