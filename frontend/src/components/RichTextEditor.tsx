import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { RichTextEditor as MantineRichTextEditor } from '@mantine/tiptap';
import { useEffect } from 'react';
import { ScrollArea } from '@mantine/core';

interface RichTextEditorProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

// TODO: The rich text editor doesn't accept a placeholder, you have to work around it with some JS gymnastics.
export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  // useLayoutEffect(() => {
  //   const contentEditable = document.getElementsByClassName('ProseMirror')[0];
  //   contentEditable.classList.add('bg-white', 'text-black');
  // }, []);

  useEffect(() => {
    if (editor && (editor || value)) {
      editor.commands.setContent(value);
    }
  }, [editor, value]); // Re-run when editor or content changes

  return (
    <MantineRichTextEditor
      editor={editor}
      classNames={{ root: '!border-none' }}
    >
      <MantineRichTextEditor.Toolbar sticky>
        <MantineRichTextEditor.ControlsGroup>
          <MantineRichTextEditor.Bold />
          <MantineRichTextEditor.Italic />
          <MantineRichTextEditor.Underline />
          <MantineRichTextEditor.Strikethrough />
          <MantineRichTextEditor.ClearFormatting />
          <MantineRichTextEditor.Highlight />
          <MantineRichTextEditor.Code />
        </MantineRichTextEditor.ControlsGroup>

        <MantineRichTextEditor.ControlsGroup>
          <MantineRichTextEditor.H1 />
          <MantineRichTextEditor.H2 />
          <MantineRichTextEditor.H3 />
          <MantineRichTextEditor.H4 />
        </MantineRichTextEditor.ControlsGroup>

        <MantineRichTextEditor.ControlsGroup>
          <MantineRichTextEditor.Blockquote />
          <MantineRichTextEditor.Hr />
          <MantineRichTextEditor.BulletList />
          <MantineRichTextEditor.OrderedList />
          <MantineRichTextEditor.Subscript />
          <MantineRichTextEditor.Superscript />
        </MantineRichTextEditor.ControlsGroup>

        <MantineRichTextEditor.ControlsGroup>
          <MantineRichTextEditor.Link />
          <MantineRichTextEditor.Unlink />
        </MantineRichTextEditor.ControlsGroup>

        <MantineRichTextEditor.ControlsGroup>
          <MantineRichTextEditor.AlignLeft />
          <MantineRichTextEditor.AlignCenter />
          <MantineRichTextEditor.AlignJustify />
          <MantineRichTextEditor.AlignRight />
        </MantineRichTextEditor.ControlsGroup>

        <MantineRichTextEditor.ControlsGroup>
          <MantineRichTextEditor.Undo />
          <MantineRichTextEditor.Redo />
        </MantineRichTextEditor.ControlsGroup>
      </MantineRichTextEditor.Toolbar>

      <ScrollArea h={'70vh'} type="auto">
        <MantineRichTextEditor.Content />
      </ScrollArea>
    </MantineRichTextEditor>
  );
}
