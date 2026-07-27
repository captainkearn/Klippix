import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  File,
  Folder,
  MoreVertical,
  Plus,
  Search,
  Upload
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

export function FileManager({ files, setFiles }) {
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState("printer.cfg");
  const [draft, setDraft] = useState(
    files.find((file) => file.name === "printer.cfg")?.content ?? ""
  );
  const [savedDraft, setSavedDraft] = useState(draft);
  const uploadRef = useRef(null);

  const visibleFiles = useMemo(
    () =>
      files.filter((file) =>
        file.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      ),
    [files, query]
  );
  const selected = files.find((file) => file.name === selectedName);
  const dirty = selected?.type === "file" && draft !== savedDraft;

  function selectFile(file) {
    setSelectedName(file.name);
    if (file.type === "file") {
      setDraft(file.content ?? "");
      setSavedDraft(file.content ?? "");
    }
  }

  function save() {
    setFiles((current) =>
      current.map((file) =>
        file.name === selectedName
          ? { ...file, content: draft, modified: "Just now" }
          : file
      )
    );
    setSavedDraft(draft);
  }

  function uploadFiles(event) {
    const additions = Array.from(event.target.files ?? []).map((file) => ({
      name: file.name,
      type: "file",
      modified: "Just now",
      size:
        file.size < 1024
          ? `${file.size} B`
          : `${(file.size / 1024).toFixed(1)} KB`,
      content: "# Uploaded file preview\n"
    }));
    setFiles((current) => [...current, ...additions]);
    event.target.value = "";
  }

  return (
    <section className="file-manager">
      <div className="file-toolbar">
        <div className="nav-buttons" aria-label="File navigation">
          <button type="button" aria-label="Back">
            <ChevronLeft size={18} />
          </button>
          <button type="button" aria-label="Forward">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="breadcrumbs" aria-label="Current path">
          <span>Home</span>
          <i>/</i>
          <span>printer_data</span>
          <i>/</i>
          <strong>config</strong>
        </div>
        <label className="search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files"
          />
        </label>
        <input
          ref={uploadRef}
          className="visually-hidden"
          type="file"
          multiple
          onChange={uploadFiles}
        />
        <button
          className="primary-button"
          type="button"
          onClick={() => uploadRef.current?.click()}
        >
          <Upload size={16} />
          Upload
        </button>
        <button className="secondary-button new-button" type="button">
          <Plus size={16} />
          New
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="files-workspace">
        <div className="file-list">
          <div className="file-table-header">
            <span>Name</span>
            <span>Modified</span>
            <span>Size</span>
            <span />
          </div>
          <div className="file-rows">
            {visibleFiles.map((file) => (
              <button
                type="button"
                className={`file-row ${
                  selectedName === file.name ? "selected" : ""
                }`}
                onClick={() => selectFile(file)}
                key={file.name}
              >
                <span className="file-name">
                  {file.type === "folder" ? (
                    <Folder size={20} />
                  ) : (
                    <File size={20} />
                  )}
                  <strong>{file.name}</strong>
                </span>
                <span>{file.modified}</span>
                <span>{file.size}</span>
                <MoreVertical size={17} />
              </button>
            ))}
            {visibleFiles.length === 0 && (
              <div className="empty-files">No files match “{query}”.</div>
            )}
          </div>
          <div className="file-list-footer">
            <span>{visibleFiles.length} items</span>
            <span>{selected ? `1 item selected · ${selected.size}` : "No selection"}</span>
          </div>
        </div>

        <div className="editor">
          {selected?.type === "file" ? (
            <>
              <div className="editor-heading">
                <div>
                  <strong>
                    <File size={18} />
                    {selected.name}
                    {dirty && <i className="unsaved-dot" title="Unsaved changes" />}
                  </strong>
                  <span>{dirty ? "Unsaved changes" : `Modified ${selected.modified}`}</span>
                </div>
                <button
                  className="primary-button save-button"
                  type="button"
                  onClick={save}
                  disabled={!dirty}
                >
                  Save
                </button>
                <button className="icon-button" type="button" aria-label="File options">
                  <MoreVertical size={17} />
                </button>
              </div>
              <div className="code-editor">
                <div className="line-numbers" aria-hidden="true">
                  {draft.split("\n").map((_, index) => (
                    <span key={index}>{index + 1}</span>
                  ))}
                </div>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  spellCheck="false"
                  aria-label={`Edit ${selected.name}`}
                />
              </div>
              <div className="editor-footer">
                <span>Ln 1, Col 1</span>
                <span>UTF-8</span>
              </div>
            </>
          ) : (
            <div className="folder-preview">
              <Folder size={34} />
              <strong>{selected?.name ?? "Select a file"}</strong>
              <span>Choose a configuration file to open the editor.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
