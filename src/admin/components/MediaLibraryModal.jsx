import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { InputText } from "primereact/inputtext";
import { fetchFromApi } from "../..//utils/fetchFromApi.js";

const MediaLibraryModal = ({ visible, onHide, onSelect, selectedMedia = [] }) => {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState("");
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
    
    useEffect(() => {
        if (mediaFiles.length > 0 && selectedMedia.length > 0) {
            const preSelectedMedia = mediaFiles.filter((media) =>
                selectedMedia.includes(media.id)
            );
            if (JSON.stringify(preSelectedMedia) !== JSON.stringify(selectedMediaState)) {
                setSelectedMediaState(preSelectedMedia);
            }
        }
    }, [selectedMedia, mediaFiles]); 

    const handleConfirmSelection = () => {
        if (selectedMediaState.length === 0) {
            console.error("No media selected!");
            return;
        }
        const selectedMediaIds = selectedMediaState.map((media) => media.id);
        onSelect(selectedMediaIds);
        onHide();
    };

    return (
        <Dialog
            header={"Select Media for Gallery"}
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
                    <div className="mb-3">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Search by filename or alt text"
                                className="w-full"
                            />
                        </span>
                    </div>
                    <DataTable
                        value={mediaFiles}
                        paginator
                        rows={5}
                        globalFilter={globalFilter}
                        selection={selectedMediaState}
                        onSelectionChange={(e) => {
                            setSelectedMediaState(e.value);
                        }}
                        selectionMode="multiple"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />
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
                    </DataTable>
                    <div className="mt-3 flex justify-content-end">
                        <Button
                            label="Confirm Selection"
                            icon="pi pi-check"
                            onClick={handleConfirmSelection}
                            disabled={selectedMediaState.length === 0}
                        />
                    </div>
                </>
            )}
        </Dialog>
    );
};

export default MediaLibraryModal;