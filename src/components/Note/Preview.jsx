import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Box } from '@chakra-ui/react';
import './Note.scss';
import '../../assets/markdown.scss';

const Preview = ({ markdown }) => {
  return (
    <div className='preview'>
      <div className='preview__scroll'>
        <Box className='markdown-wrapper'>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    language={match[1]}
                    PreTag='div'
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </Box>
      </div>
    </div>
  );
};

export default Preview;
