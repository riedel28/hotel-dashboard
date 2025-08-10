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

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newTitle: string) => void;
}

export function AddCategoryModal({
  open,
  onOpenChange,
  onSave
}: AddCategoryModalProps) {
  const [title, setTitle] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setTitle('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Add subcategory</Trans>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="new-category-title">
            <Trans>Category name</Trans>
          </Label>
          <Input
            id="new-category-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder=""
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <Trans>Cancel</Trans>
          </Button>
          <Button onClick={() => onSave(title)} disabled={!title.trim()}>
            <Trans>Add</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
