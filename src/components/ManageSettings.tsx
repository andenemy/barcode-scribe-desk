import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Trash2, FolderOpen, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ManageSettingsProps {
  categories: string[];
  locations: string[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onAddLocation: (location: string) => void;
  onRemoveLocation: (location: string) => void;
}

export function ManageSettings({
  categories,
  locations,
  onAddCategory,
  onRemoveCategory,
  onAddLocation,
  onRemoveLocation
}: ManageSettingsProps) {
  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      toast({
        title: 'Invalid Category',
        description: 'Category name cannot be empty',
        variant: 'destructive'
      });
      return;
    }
    if (categories.includes(trimmed)) {
      toast({
        title: 'Duplicate Category',
        description: 'This category already exists',
        variant: 'destructive'
      });
      return;
    }
    onAddCategory(trimmed);
    setNewCategory('');
    toast({
      title: 'Category Added',
      description: `Added category: ${trimmed}`
    });
  };

  const handleAddLocation = () => {
    const trimmed = newLocation.trim();
    if (!trimmed) {
      toast({
        title: 'Invalid Location',
        description: 'Location name cannot be empty',
        variant: 'destructive'
      });
      return;
    }
    if (locations.includes(trimmed)) {
      toast({
        title: 'Duplicate Location',
        description: 'This location already exists',
        variant: 'destructive'
      });
      return;
    }
    onAddLocation(trimmed);
    setNewLocation('');
    toast({
      title: 'Location Added',
      description: `Added location: ${trimmed}`
    });
  };

  const handleRemoveCategory = (category: string) => {
    if (categories.length <= 1) {
      toast({
        title: 'Cannot Remove',
        description: 'At least one category must exist',
        variant: 'destructive'
      });
      return;
    }
    if (confirm(`Remove category "${category}"? Items in this category will need to be reassigned.`)) {
      onRemoveCategory(category);
      toast({
        title: 'Category Removed',
        description: `Removed category: ${category}`
      });
    }
  };

  const handleRemoveLocation = (location: string) => {
    if (locations.length <= 1) {
      toast({
        title: 'Cannot Remove',
        description: 'At least one location must exist',
        variant: 'destructive'
      });
      return;
    }
    if (confirm(`Remove location "${location}"? Items in this location will need to be reassigned.`)) {
      onRemoveLocation(location);
      toast({
        title: 'Location Removed',
        description: `Removed location: ${location}`
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Manage Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories & Locations</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Categories Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Categories ({categories.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New category name..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge key={category} variant="secondary" className="gap-2 px-3 py-1.5">
                    {category}
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Locations Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Locations ({locations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New location name..."
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                />
                <Button onClick={handleAddLocation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {locations.map(location => (
                  <Badge key={location} variant="outline" className="gap-2 px-3 py-1.5">
                    {location}
                    <button
                      onClick={() => handleRemoveLocation(location)}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
