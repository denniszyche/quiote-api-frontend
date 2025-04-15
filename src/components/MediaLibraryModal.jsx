import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Image } from 'primereact/image';

const MediaLibraryModal = ({ visible, onHide, onSelect }) => {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMediaFiles = async () => {
            try {
                const response = await fetch("http://localhost:3000/media/all-media", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch media files.");
                }
                const data = await response.json();
                setMediaFiles(data.media);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching media files:", error);
                setLoading(false);
            }
        };
        fetchMediaFiles();
    }, []);

    const handleSelect = (media) => {
        onSelect(media.id);
        onHide();
    };

    return (
        <Dialog
            header="Select Featured Image"
            visible={visible}
            style={{ width: "50vw" }}
            onHide={onHide}
        >
            {loading ? (
                <p>Loading...</p>
            ) : (
                <DataTable value={mediaFiles} paginator rows={5}>
                    <Column
                        header="Thumbnail"
                        body={(rowData) => (
                            <Image 
                                src={rowData.filepath ? `http://localhost:3000/${rowData.filepath}` : "/images/cms-logo.svg"}
                                zoomSrc={rowData.filepath ? `http://localhost:3000/${rowData.filepath}` : "/images/cms-logo.svg"}
                                alt={rowData.altText || "Media Thumbnail"} 
                                width="80" 
                                height="80" 
                                preview
                                style={{
                                    objectFit: "cover",
                                    backgroundColor: "#f0f0f0",
                                }}
                            />
                        )}
                    />
                    <Column field="filename" header="Filename" />
                    <Column field="altText" header="Alt Text" />
                    <Column
                        header="Action"
                        body={(rowData) => (
                            <Button
                                label="Select"
                                onClick={() => handleSelect(rowData)}
                                className="p-button-sm"
                            />
                        )}
                    />
                </DataTable>
            )}
        </Dialog>
    );
};

export default MediaLibraryModal;