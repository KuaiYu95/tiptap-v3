import { Editor } from '@tiptap/react';
import React from 'react';
import { AddCircleFillIcon, ArrowDownSLineIcon } from '../../Icons';
import Menu from '../../Menu';
import ToolbarItem from '../Item';
import { buildInsertMenuList } from './menu-builders';

interface EditorInsertProps {
  editor: Editor;
}

const EditorInsert = ({ editor }: EditorInsertProps) => {
  const menuList = React.useMemo(() => buildInsertMenuList(editor), [editor]);

  return <Menu
    width={224}
    maxHeight={'calc(100vh - 312px)'}
    context={<ToolbarItem
      tip={'插入'}
      text={'插入'}
      icon={<AddCircleFillIcon sx={{ fontSize: '1rem' }} />}
    />}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    arrowIcon={<ArrowDownSLineIcon sx={{ fontSize: '1rem', transform: 'rotate(-90deg)' }} />}
    list={menuList}
  />
}

export default EditorInsert;
