"use client";

import React, { useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Subscript,
    Superscript,
    Code,
    Link,
    AutoLink,
    LinkImage,
    List,
    ListProperties,
    TodoList,
    BlockQuote,
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    TableColumnResize,
    TableCaption,
    Image,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    ImageResize,
    ImageUpload,
    AutoImage,
    ImageInsert,
    MediaEmbed,
    HorizontalLine,
    CodeBlock,
    Alignment,
    Font,
    SourceEditing,
    GeneralHtmlSupport,
    FindAndReplace,
    RemoveFormat,
    Fullscreen
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import { authFetch } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

interface CKEditorCustomProps {
    value: string;
    onChange: (data: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

// Custom Upload Adapter connecting CKEditor to Laravel /admin/v1/upload
class LaravelUploadAdapter {
    private loader: any;

    constructor(loader: any) {
        this.loader = loader;
    }

    upload(): Promise<{ default: string }> {
        return this.loader.file
            .then((file: File) => new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('folder', 'blogs');

                authFetch('/admin/v1/upload', {
                    method: 'POST',
                    body: formData,
                })
                .then(async res => {
                    const data = await res.json();
                    if (res.ok && (data.path || data.url)) {
                        resolve({
                            default: getImageUrl(data.path || data.url)
                        });
                    } else {
                        reject(data.error || data.message || 'Image upload failed');
                    }
                })
                .catch(err => {
                    reject(err?.message || 'Network error during image upload');
                });
            }));
    }

    abort() {
        // Handled cleanly if aborted
    }
}

function uploadAdapterPlugin(editor: any) {
    const fileRepository = editor.plugins.get('FileRepository');
    if (fileRepository) {
        fileRepository.createUploadAdapter = (loader: any) => {
            return new LaravelUploadAdapter(loader);
        };
    }
}

export default function CKEditorCustom({
    value,
    onChange,
    placeholder = 'Write your article content here...',
    disabled = false,
}: CKEditorCustomProps) {

    const editorConfig = useMemo(() => ({
        licenseKey: 'GPL' as const,
        placeholder,
        extraPlugins: [uploadAdapterPlugin],
        plugins: [
            Essentials,
            Paragraph,
            Heading,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Subscript,
            Superscript,
            Code,
            Link,
            AutoLink,
            LinkImage,
            List,
            ListProperties,
            TodoList,
            BlockQuote,
            Table,
            TableToolbar,
            TableProperties,
            TableCellProperties,
            TableColumnResize,
            TableCaption,
            Image,
            ImageToolbar,
            ImageCaption,
            ImageStyle,
            ImageResize,
            ImageUpload,
            AutoImage,
            ImageInsert,
            MediaEmbed,
            HorizontalLine,
            CodeBlock,
            Alignment,
            Font,
            SourceEditing,
            GeneralHtmlSupport,
            FindAndReplace,
            RemoveFormat,
            Fullscreen
        ],
        toolbar: {
            items: [
                'undo', 'redo',
                '|',
                'heading',
                '|',
                'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
                '|',
                'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code', 'removeFormat',
                '|',
                'alignment',
                '|',
                'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent',
                '|',
                'link', 'insertImage', 'insertTable', 'blockQuote', 'codeBlock', 'mediaEmbed', 'horizontalLine',
                '|',
                'findAndReplace', 'sourceEditing', 'fullscreen'
            ],
            shouldNotGroupWhenFull: false
        },
        heading: {
            options: [
                { model: 'paragraph' as const, title: 'Paragraph', class: 'ck-heading_paragraph' },
                { model: 'heading1' as const, view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                { model: 'heading2' as const, view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                { model: 'heading3' as const, view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                { model: 'heading4' as const, view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
            ]
        },
        image: {
            toolbar: [
                'toggleImageCaption',
                'imageTextAlternative',
                '|',
                'imageStyle:inline',
                'imageStyle:wrapText',
                'imageStyle:breakText',
                '|',
                'resizeImage',
                '|',
                'linkImage'
            ]
        },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells',
                'tableProperties',
                'tableCellProperties',
                'toggleTableCaption'
            ]
        },
        htmlSupport: {
            allow: [
                {
                    name: /.*/,
                    attributes: true,
                    classes: true,
                    styles: true
                }
            ]
        }
    }), [placeholder]);

    return (
        <div className="ckeditor-wrapper w-full">
            <CKEditor
                editor={ClassicEditor}
                data={value || ''}
                disabled={disabled}
                config={editorConfig as any}
                onChange={(_event, editor) => {
                    const data = editor.getData();
                    onChange(data);
                }}
            />
        </div>
    );
}
