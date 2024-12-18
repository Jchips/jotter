import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, HStack } from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import { useMarkdown } from '../../hooks/useMarkdown';
import Preview from './Preview';
import api from '@/util/api';
import './Note.scss';
import '../../assets/markdown.scss';

const View = () => {
  const [note, setNote] = useState();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { markdown, setMarkdown } = useMarkdown('');
  const { logout } = useAuth();
  const { noteId } = useParams();
  const navigate = useNavigate();

  console.log('noteId', noteId); // delete later

  useEffect(() => {
    const getNote = async () => {
      try {
        setLoading(true);
        setError('');
        let note = await api.getNote(noteId);
        console.log('note:', note.data); // delete later
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

  const handleEdit = () => {
    navigate(`/editor/${noteId}`);
    // navigate('/editor');
  };

  const handleExit = () => {
    navigate(-1);
    setMarkdown('');
  };
  return (
    !loading && (
      <div>
        <Preview markdown={markdown} />
        <div className='footer'>
          <HStack>
            <Button variant='solid' onClick={handleExit}>
              Exit
            </Button>
            <Button className='button1' variant='solid' onClick={handleEdit}>
              Edit
            </Button>
          </HStack>
        </div>
      </div>
    )
  );
};

export default View;
