import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { useSettings } from '../../contexts/SettingsContext';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';

interface Props {
  content: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ content, onChange }: Props) {
  const { theme } = useSettings();

  return (
    <CodeMirror
      value={content}
      onChange={onChange}
      extensions={[markdown()]}
      theme={theme === 'dark' ? githubDark : githubLight}
      className="h-full text-sm"
      height="100%"
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
      }}
    />
  );
}
