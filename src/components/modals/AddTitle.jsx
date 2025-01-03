import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Field } from '@/components/ui/field';
import {
  DialogRoot,
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { ROOT_FOLDER } from '@/hooks/useFolder';
import api from '@/util/api';

const AddTitle = (props) => {
  const {
    addTitleOpen,
    setAddTitleOpen,
    selectedCreate,
    notes,
    folders,
    setNotes,
    setFolders,
  } = props;
  let { currentFolder } = props;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
    },
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  /**
   * Adds a title to either a note or a folder
   * If `currentFolder` is null (not in root or any other), exit function
   * @param {Object} titleControl - The input the user types as a title
   * @returns - nothing
   */
  const onSubmit = async (titleControl) => {
    if (currentFolder === null) return;
    currentFolder = currentFolder?.data ? currentFolder.data : currentFolder;
    let path = currentFolder === ROOT_FOLDER ? [] : [ROOT_FOLDER];
    let currentFolderPath =
      currentFolder !== ROOT_FOLDER ? JSON.parse(currentFolder.path) : path; // parse from db
    path = [...currentFolderPath];

    // Adds current folder to the path
    if (currentFolder !== ROOT_FOLDER) {
      path.push({
        id: currentFolder.id,
        title: currentFolder.title,
      });
    }
    try {
      setSaving(true);
      setError('');
      let res;
      switch (selectedCreate) {
        // add note
        case 'note':
          res = await api.addNote({
            title: titleControl.title,
            content: '',
            userId: user.id,
            folderId: currentFolder.id,
          });
          setNotes([...notes, res.data]);
          break;
        // add folder
        case 'folder':
          res = await api.addFolder({
            title: titleControl.title,
            userId: user.id,
            parentId: currentFolder.id,
            path,
          });
          setFolders([...folders, res.data]);
          break;
      }
      setAddTitleOpen(false);
    } catch (err) {
      setError('Failed to create ' + selectedCreate);
      console.error(err);
    }
    reset({
      title: '',
    });
    setSaving(false);
  };

  return (
    <DialogRoot modal={true} open={addTitleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {selectedCreate}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            {error ? (
              <div style={{ marginBottom: '20px' }}>
                <Alert status='error' title={error} />
              </div>
            ) : null}
            <Field label='Title'>
              <Controller
                name='title'
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    type='text'
                    value={value}
                    onChange={onChange}
                    placeholder={`Give ${selectedCreate} a title`}
                  />
                )}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant='outline' onClick={() => setAddTitleOpen(false)}>
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              type='submit'
              className='button1'
              variant='solid'
              disabled={saving}
            >
              Create {selectedCreate}
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger onClick={() => setAddTitleOpen(false)} />
      </DialogContent>
    </DialogRoot>
  );
};

export default AddTitle;
