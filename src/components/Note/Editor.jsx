import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { throttle } from 'lodash';
import { Button, HStack, Text, Box } from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import CodeMirror from './CodeMirror';
import { useMarkdown } from '../../hooks/useMarkdown';
import { useAuth } from '@/hooks/useAuth';
import ExitNote from '../modals/ExitNote';
import Preview from './Preview';
import Loading from '../Loading';
import api from '@/util/api';
import getWordCount from '@/util/getWordCount';
import './Editor.scss';
import './markdown.scss';

const Editor = () => {
  const [note, setNote] = useState();
  const [error, setError] = useState('');
  const [words, setWords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openExit, setOpenExit] = useState(false);
  const { markdown, setMarkdown } = useMarkdown();
  const { logout } = useAuth();
  const { noteId } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef(null);

  // fetch the note
  useEffect(() => {
    const getNote = async () => {
      setLoading(true);
      try {
        setError('');
        let note = await api.getNote(noteId);
        setNote(note.data);
        setMarkdown(note.data.content);
        setWords(getWordCount(note.data.content));
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

  // Syncs the editor and preview scrollbars to each other
  const editorRef = useCallback((node) => {
    if (node) {
      const editorView = node;
      const syncScroll = throttle(() => {
        const scrollRatio =
          editorView.scrollTop /
          (editorView.scrollHeight - editorView.clientHeight);
        if (
          previewRef.current &&
          previewRef.current.scrollHeight > previewRef.current.clientHeight
        ) {
          previewRef.current.scrollTop =
            scrollRatio *
            (previewRef.current.scrollHeight - previewRef.current.clientHeight);
        }
      }, 100);
      editorView.addEventListener('scroll', syncScroll);
      node.cleanup = () => editorView.removeEventListener('scroll', syncScroll);
    } else {
      editorRef.current?.cleanup?.();
    }
  }, []);

  /**
   * Updates the markdown state with the current markdown content
   * @param {String} value - The markdown content that user types
   */
  const update = useCallback(
    (value) => {
      setMarkdown(value);
      setWords(getWordCount(value));
    },
    [setMarkdown]
  );

  // Saves changes to the note
  const handleSave = useCallback(async () => {
    try {
      setError('');
      setSaving(true);
      let res = await api.updateNote(
        {
          content: markdown,
          updatedAt: Date.now(),
        },
        noteId
      );
      setNote(res.data);
    } catch (err) {
      setError('Failed to save note');
      console.error(err);
    }
    setSaving(false);
  }, [markdown, noteId]);

  // If user presses ctrl-s, the note saves it's changes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [markdown, handleSave]);

  // Saves the note and exits
  const handleSaveAndExit = () => {
    handleSave();
    navigate(`/preview/${noteId}`);
  };

  // Exits the editor without saving
  const handleExit = () => {
    if (note.content !== markdown) {
      setOpenExit(true);
    } else {
      navigate(`/preview/${noteId}`);
    }
  };

  // Loading circle
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
          <div className='editor__wrap' ref={editorRef}>
            <CodeMirror
              value={markdown}
              placeholderText='Type Markdown here...'
              indentWithTab={true}
              onChange={update}
              options={{
                lineWrapping: true,
                indentWithTabs: true,
              }}
            />
          </div>
          <div className='preview__scroll' ref={previewRef}>
            <Preview markdown={markdown} />
          </div>
        </div>
      )}
      <HStack className='footer'>
        <Button className='button1' variant='solid' onClick={handleSaveAndExit}>
          Save and exit
        </Button>
        <Text>{words} words</Text>
        <Box>
          <Button className='button1' variant='solid' onClick={handleExit}>
            Exit editor
          </Button>
          <Button
            className='button1'
            variant='solid'
            onClick={handleSave}
            disabled={saving}
          >
            Save changes
          </Button>
        </Box>
      </HStack>
      <ExitNote openExit={openExit} setOpenExit={setOpenExit} noteId={noteId} />
    </div>
  );
};

export default Editor;
