import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    if (!file) {
      return;
    }

    const authorization_token = localStorage.getItem("authorization_token");
    if (!authorization_token) {
      console.error("Authorization token not found in localStorage");
      return;
    }

    const headers = new Headers();
    headers.append("Authorization", `Basic ${authorization_token}`);

    const response = await fetch(
      url + "?" + new URLSearchParams({ name: file.name }),
      { headers }
    );
    if (!response.ok) {
      console.error("Failed to get the presigned URL");
      return;
    }

    const data = await response.json();
    console.log("File to upload: ", file.name);
    console.log("Uploading to: ", data.url);

    const result = await fetch(data.url, {
      method: "PUT",
      body: file,
      headers,
    });

    if (result.ok) {
      console.log("File uploaded successfully");
    } else {
      console.error("Failed to upload the file");
    }

    setFile(undefined);
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
