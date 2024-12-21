import { Link } from 'react-router';
import { LuFolder } from 'react-icons/lu';
import { Card, Heading, HStack, Button } from '@chakra-ui/react';

const FolderCard = ({ folder }) => {
  return (
    <Card.Root
      size='sm'
      className='folder-card'
      as={Link}
      to={{ pathname: `/folder/${folder.id}`, pathState: { folder: folder } }}
    >
      <Card.Body>
        <HStack spacing={4}>
          <LuFolder />
          <Heading size='md'>{folder.title}</Heading>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

export default FolderCard;