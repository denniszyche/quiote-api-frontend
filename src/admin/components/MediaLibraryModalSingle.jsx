import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { fetchFromApi } from "../..//utils/fetchFromApi.js";

const MediaLibraryModalSingle = ({ visible, onHide, onSelect}) => {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMediaState, setSelectedMediaState] = useState([]);

    useEffect(() => {
        const fetchMediaFiles = async () => {
            try {
                const response = await fetchFromApi("/media/all-media", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setMediaFiles(response.media || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching media files:", error);
                setLoading(false);
            }
        };
        fetchMediaFiles();
    }, []);
    

    return (
        <Dialog
            header={"Select Featured Media"}
            visible={visible}
            style={{ width: "50vw" }}
            onHide={onHide}
        >
            {loading ? (
                <p>Loading...</p>
            ) : mediaFiles.length === 0 ? (
                <p>No media files found.</p>
            ) : (
                <>
                    <DataTable
                        value={mediaFiles}
                        paginator
                        rows={5}
                        selection={selectedMediaState}
                        onSelectionChange={(e) => {
                            setSelectedMediaState(e.value);
                        }}
                        
                    >
                        <Column
                            header="Thumbnail"
                            body={(rowData) => {
                                let thumbSrc = "/images/cms-logo.svg";
                                if (rowData.filepath) {
                                    const match = rowData.filepath.match(/\.(jpe?g)$/i);
                                    const ext = match ? match[0] : ".jpg";
                                    const baseName = rowData.filepath.replace(/\.(jpe?g)$/i, "");
                                    thumbSrc = `https://quiote-api.dztestserver.de/${baseName}-480w${ext}`;
                                }
                                return (
                                    <Image
                                        src={thumbSrc}
                                        zoomSrc={rowData.filepath ? `https://quiote-api.dztestserver.de/${rowData.filepath}` : "/images/cms-logo.svg"}
                                        alt={rowData.altText || "Media Thumbnail"}
                                        width="80"
                                        height="80"
                                        preview
                                        style={{
                                            objectFit: "cover",
                                            backgroundColor: "#f0f0f0",
                                        }}
                                    />
                                );
                            }}
                        />
                        <Column field="filename" header="Filename" />
                        <Column field="altText" header="Alt Text" />
                        <Column
                        header="Action"
                        body={(rowData) => (
                            <Button
                                label="Select"
                                icon="pi pi-check"
                                className="p-button-success"
                                onClick={() => {
                                    onSelect(rowData);
                                    onHide();
                                }}
                            />
                        )}
                    />
                    </DataTable>
                </>
            )}
        </Dialog>
    );
};

export default MediaLibraryModalSingle;