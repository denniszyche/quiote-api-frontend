import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { InputText } from "primereact/inputtext";

const MediaLibraryModal = ({ visible, onHide, onSelect, multiSelect = false, selectedMedia = [] }) => {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState("");
    const [selectedMediaState, setSelectedMediaState] = useState(multiSelect ? [] : null);

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
                setMediaFiles(data.media || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching media files:", error);
                setLoading(false);
            }
        };

        fetchMediaFiles();
    }, []);

    useEffect(() => {
        if (multiSelect) {
            const preSelectedMedia = mediaFiles.filter((media) =>
                selectedMedia.includes(media.id)
            );
            setSelectedMediaState(preSelectedMedia); // array
        } else {
            const preSelectedMedia = mediaFiles.find((media) =>
                media.id === selectedMedia[0]
            );
            setSelectedMediaState(preSelectedMedia || null); // object
        }
    }, [multiSelect, selectedMedia, mediaFiles]);


    const handleConfirmSelection = () => {
        console.log("Selected Media:", selectedMediaState);
        if (multiSelect) {
            if (selectedMediaState.length === 0) {
                console.error("No media selected!");
                return;
            }
            const selectedMediaIds = selectedMediaState.map((media) => media.id);
            onSelect(selectedMediaIds);
        } else {
            if (!selectedMediaState) {
                console.error("No media selected!");
                return;
            }
            onSelect(selectedMediaState.id);
        }
        onHide();
    };

    return (
        <Dialog
            header={multiSelect ? "Select Media for Gallery" : "Select Featured Image"}
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
                            console.log("Selection Change Event:", e.value);
                            if (multiSelect) {
                                setSelectedMediaState(e.value);
                            } else {
                                setSelectedMediaState(e.value);
                            }
                        }}
                        selectionMode={multiSelect ? "checkbox" : "single"}
                    >
                        {multiSelect && <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />}
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

                        {!multiSelect && (
                            <Column
                                header="Action"
                                body={(rowData) => (
                                    <Button
                                        label="Select"
                                        icon="pi pi-check"
                                        className="p-button-sm p-button-primary"
                                        onClick={() => {
                                            setSelectedMediaState(rowData);
                                            handleConfirmSelection();
                                        }}
                                    />
                                )}
                            />
                        )}
                    </DataTable>
                    {multiSelect && (
                        <div className="mt-3 flex justify-content-end">
                            <Button
                                label="Confirm Selection"
                                icon="pi pi-check"
                                onClick={handleConfirmSelection}
                                disabled={multiSelect ? selectedMediaState.length === 0 : !selectedMediaState}
                            />
                        </div>
                    )}
                </>
            )}
        </Dialog>
    );
};

export default MediaLibraryModal;