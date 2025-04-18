
import { Editor } from "primereact/editor";

const ContentEditor = ({ value, onChange }) => {
    const renderHeader = () => {
        return (
            <span className="ql-formats">
                <button className="ql-bold" aria-label="Bold"></button>
                <button className="ql-italic" aria-label="Italic"></button>
                <button className="ql-list" aria-label="List"></button>
                <button className="ql-link" aria-label="Link"></button>

            </span>
        );
    };
    const header = renderHeader();
    return (
        <Editor
            value={value}
            onTextChange={(e) => onChange(e.htmlValue)}
            headerTemplate={header}
            style={{ height: "320px" }}
        />   
    )
}
export default ContentEditor;