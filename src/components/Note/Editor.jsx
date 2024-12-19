import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, HStack } from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import CodeMirror from '@uiw/react-codemirror';
import { markdown as md } from '@codemirror/lang-markdown';
import { useMarkdown } from '../../hooks/useMarkdown';
import { useAuth } from '@/hooks/useAuth';
import Preview from './Preview';
import Loading from '../Loading';
import api from '@/util/api';
import './Note.scss';
import '../../assets/markdown.scss';

const Editor = () => {
  const [note, setNote] = useState();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { markdown, setMarkdown } = useMarkdown();
  const { logout } = useAuth();
  const { noteId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getNote = async () => {
      setLoading(true);
      try {
        setError('');
        let note = await api.getNote(noteId);
        setNote(note.data);
        setMarkdown(note.data.content);
      } catch (err) {
        console.error(err);
        err.response.data.message === 'jwt expired'
          ? logUserOut()
          : setError('Failed to open note');
      }
    };
    const logUserOut = () => {
      navigate('/login');
      logout();
    };
    getNote();
    setLoading(false);
  }, [noteId, setMarkdown, logout, navigate]);

  const update = (value) => {
    setMarkdown(value);
  };

  const handleSave = async () => {
    try {
      setError('');
      setSaving(true);
      let res = await api.updateNote(
        {
          content: markdown,
          updatedAt: Date.now(),
        },
        note.id
      );
      console.log('updated note:', res.data); // delete later
    } catch (err) {
      setError('Failed to save note');
      console.error(err);
    }
    setSaving(false);
  };

  const handleSaveAndExit = () => {
    handleSave();
    navigate(-1);
  };

  if (!note) {
    return <Loading />;
  }

  return (
    <div className='note-window'>
      {error && (
        <div>
          <Alert status='error' title={error} />
        </div>
      )}
      {!loading && (
        <div className='note-body'>
          <div className='editor__wrap'>
            <CodeMirror
              value={markdown}
              className='editor'
              extensions={[md()]}
              placeholder='Type Markdown here...'
              onChange={update}
            />
          </div>
          <Preview markdown={markdown} />
        </div>
      )}
      <div className='footer'>
        <HStack>
          <Button
            className='button1'
            variant='solid'
            onClick={handleSaveAndExit}
          >
            Save and exit
          </Button>
          <Button
            className='button1'
            variant='solid'
            onClick={handleSave}
            disabled={saving}
          >
            Save changes
          </Button>
        </HStack>
      </div>
    </div>
  );
};

export default Editor;
