
"use client"

import React, { useState, useEffect  } from 'react';
import axios from 'axios';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { FaFolder  } from 'react-icons/fa';

import { BsArrowRight } from 'react-icons/bs';
import { BiDownload } from 'react-icons/bi';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import JSZip from 'jszip';
import { BsFillLockFill } from 'react-icons/bs';
import { FaFileUpload } from 'react-icons/fa';
import Footer from '../footer/footer';
import Navbar from '../navbar/Navbar';
function App() {

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  
  const [files, setSelectedFiles] = useState([]);
  const [conversionProgress, setConversionProgress] = useState({});
  const [convert, setConvert] = useState([]);
  const [type, setType] = useState([]);
  const [individualSelectedFormats, setIndividualSelectedFormats] = useState({});

  const [totalConversionProgress, setTotalConversionProgress] = useState({});


const [convertedFiles ,  setCovertedFiles] = useState(false);


const [downloadAll, setDownloadAll] = useState();
const [downloadValidation , setDownloadValidation]=useState(true)
 
const [defaultProgress , setDefaultProgress] = useState(0)
const [downloadOne , setDownloadOne] = useState(false)
 
 

  const handleDragOver = (e) => {
    e.preventDefault();
  };






const handleFileChange1 = (event, newFiles) => {
  const updatedFiles = [...files];
  const updatedFormats = { ...individualSelectedFormats };
  let newIndex = files.length; // Starting index for new files

  newFiles.forEach((newFile, i) => {
    updatedFiles.push(newFile); // Add the new file
    const fileExtension = newFile.name.split(".").pop();
    const index = newIndex + i; // Calculate the index
    updatedFormats[`${newFile.name}_${index}`] = fileExtension; // Set default format for new file
  });

  event.target.value = '';
  setSelectedFiles(updatedFiles);
  setIndividualSelectedFormats(updatedFormats);
};

const handleFileChange = (event) => {
  const newFiles = Array.from(event.target.files);
  handleFileChange1(event, newFiles);
};

const handleDrop = (e) => {
  e.preventDefault();
  const newFiles = Array.from(e.dataTransfer.files);
  handleFileChange1(e, newFiles);
};








 
  const handleFileDelete = (fileName) => {
    const indexToDelete = files.findIndex((file, index) => `${file.name}_${index}` === fileName);
    
    if (indexToDelete === -1) {
      // File not found
      return;
    }
  
    const updatedFiles = files.filter((file, index) => index !== indexToDelete);
    
    // Update indexes in individualSelectedFormats after deletion
    const updatedFormats = {};
    updatedFiles.forEach((file, index) => {
      const newIndex = index;
      const oldIndex = index < indexToDelete ? index : index + 1;
      const oldFileKey = `${file.name}_${oldIndex}`;
      updatedFormats[`${file.name}_${newIndex}`] = individualSelectedFormats[oldFileKey];
    });
    
    setSelectedFiles(updatedFiles);
    setIndividualSelectedFormats(updatedFormats);
  
    if (updatedFiles.length === 0) {
      window.location.reload();
    }
  };
  
  

  useEffect(() => {
    const deleteFilesOnUnload = () => {
      if (convert.length > 0) {
        console.log('we are reloading ')
        convert.filter((c) => type.includes(c.fileOutput)).forEach((c) => {
          axios
            .delete(`${apiUrl}/delete/${c._id}`)
            .then(() => {
              console.log('File deleted successfully');
            })
            .catch((error) => {
              console.log('An error occurred while deleting the file:', error);
            });
        });
      }
    };

    window.addEventListener('beforeunload', deleteFilesOnUnload);

    return () => {
      window.removeEventListener('beforeunload', deleteFilesOnUnload);
    };
  }, [convert, type]);

console.log('files' , files)


const handleFileUpload = async (e) => {
  try {
  

    setCovertedFiles(true);

   
    // });
    const sanitizeFileName = (fileName) => {
      // Replace problematic symbols with underscores
      return fileName.replace(/[ %&?#<>/\\+:;=]/g, '_');
    };
    
    
    const typeArray = files.map((file) => {
      const sanitizedFileName = sanitizeFileName(file.name);
      const fileType = sanitizedFileName + Date.now() + "output." + file.name.split('.').pop();
      
      return fileType;
    });
    
    setType(typeArray);

    await Promise.all(files.map(async (file, index) => {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('convertType', file.name.split('.').pop());
      formData.append('fileOutput', typeArray[index]);
      // formData.append('filename', file.name.split(".")[0]);
      
      
      formData.append('filename', `${file.name}_${index}`);

     
 await axios.post(`${apiUrl}/compressAudio`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setConversionProgress((prevProgress) => ({
              ...prevProgress,
              [file.name]: percentCompleted,
            }));
          },
        });
      


      const res = await axios.get(`${apiUrl}/get`);
      setConvert(res.data);


      setTimeout(() => {
        
          window.location.reload();
          return;
        
      },    2 *60 * 60 * 1000);
     
    }));
  } catch (error) {
    console.log('An error occurred during the conversion:', error);
  }
};


  
  console.log( 'this type', type)
  console.log( 'this convert', convert)
  useEffect(() => {
   
    const checkConversionProgress = async () => {
      try {
        // this is for JS code start
        const responseCompressAudio = await axios.get(`${apiUrl}/progressCompressAudio`);
        const progress0 = responseCompressAudio.data.progress;



        setTotalConversionProgress({ ...progress0});


      } catch (error) {
        console.log('Error while checking conversion progress:', error);
      }
    };

    const progressCheckInterval = setInterval(checkConversionProgress, 1000);

    return () => {
      clearInterval(progressCheckInterval);
    };
  }, []);


  const [downloadOne1 , setDownloadOne1] = useState(false)

  const handleDownload = async (c) => {
    try {
      if (files.length === 1) {
        setDownloadOne1(true);
      }
  
      setDownloadOne(true);
  
      const response = await axios.get(`${apiUrl}/api/download?fileName=${c.fileOutput}`, {
        responseType: 'blob'
      });
  
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${c.filename.split('.')[0]}.${c.convertType}`); // Adjust filename if needed
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      // Delay the execution of these calls to wait for the download to complete
      setTimeout(() => {
        setDownloadOne(false);
        setDownloadOne1(false);
      }, 1000); // Assuming the download takes less than 5 seconds, adjust if needed
  
      // Delete the file after 2 hours
      setTimeout(() => {
        axios
          .delete(`${apiUrl}/delete/${c._id}`)
          .then(() => {
            console.log('File deleted successfully');
          })
          .catch((error) => {
            console.log('An error occurred while deleting the file:', error);
          });
      }, 2 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  
    const DownloadAll = () => {
      const filesToDownload = convert.filter((c) => type.includes(c.fileOutput));
    
      // Create a new instance of JSZip
      setDownloadValidation(false);
      const zip = new JSZip();
    
      // Counter to keep track of downloaded files
      let downloadedFilesCount = 0;
    
      filesToDownload.forEach((down) => {
        axios
          .get(`${apiUrl}/api/download?fileName=${down.fileOutput}`, {
            responseType: 'blob'
          })
          .then(async (response) => {
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const filename = `${down.filename.split('.')[0]}.${down.convertType}`;
            const fileType = 'blob';
    
            // Download the file
            const fileResponse = await axios.get(downloadUrl, { responseType: fileType });
            // Add file to the zip
            zip.file(filename, fileResponse.data);
    
            // Increment downloaded files count
            downloadedFilesCount++;
    
            // Check if all files are downloaded
            if (downloadedFilesCount === filesToDownload.length) {
              // Generate the zip
              zip.generateAsync({ type: 'blob' }).then((content) => {
                // Create a temporary anchor element to download the zip
                const downloadAnchor = document.createElement('a');
                downloadAnchor.href = URL.createObjectURL(content);
                downloadAnchor.download = 'downloadedFiles.zip';
                downloadAnchor.click();
    
                // Set download validation to true when the download folder is shown to the user
                setDownloadValidation(true);
              });
            }
    
            // Delete the file after it's added to the zip
            setTimeout(() => {
              axios
                .delete(`${apiUrl}/delete/${down._id}`)
                .then(() => {
                  console.log('File deleted successfully');
                })
                .catch((error) => {
                  console.log('An error occurred while deleting the file:', error);
                });
            }, 2 * 60 * 60 * 1000);
          })
          .catch((error) => {
            console.log('An error occurred while downloading the file:', error);
          });
      });
    };






useEffect(() => {
  if (convert.length > 0) {
    const completedFiles = convert.filter(item =>
      type.includes(item.fileOutput) && totalConversionProgress[item.fileOutput] === 100    );
    const allCompleted = completedFiles.length === type.length;
    setDownloadAll(allCompleted);
  }
}, [convert, totalConversionProgress]);




const incrementProgress = () => {
  setDefaultProgress((prevProgress) => {
    // Toggle between incrementing and resetting based on current progress
    const newProgress = prevProgress >= 100 ? 0 : prevProgress + 1;
    return newProgress;
  });
};

// useEffect to start incrementing progress when component mounts
useEffect(() => {
  let timer;
  const startProgress = () => {
    timer = setInterval(() => {
      incrementProgress();
    }, 10); // Increment every 10 milliseconds
  };

  // Simulate backend response delay
  setTimeout(() => {
    startProgress();
  }, 2000); // Simulated delay for backend response

  // Clear interval when component unmounts or when conversion is completed
  return () => clearInterval(timer);
}, []); // Empty dependency array ensures this effect runs only once


const handleOpenNewTab = () => {
  // Replace 'https://example.com' with the URL you want to open in the new tab
  window.open('https://sitfile.com/', '_blank');
};


  return (

    <>
    <div className="convert" onDrop={handleDrop}onDragOver={handleDragOver}>
      <Navbar/>
      {/* <h1>Iam:{totalConversionProgress}</h1> */}
      <h1 className='title'>Audio Compressor</h1>
      <p className='description'>Optimize audios with the best compression tool.</p>



<div  className='convert_files'>

{
  files.length === 0 ? (
<div className='chose_files_container'
 onDrop={handleDrop}
 onDragOver={handleDragOver}
>

  <div className='chose_device_container '>
  <label htmlFor="fileInput" className="custom-button_device">
<FaFolder className='chose_files_device_icon'/>

  Choose Audios
  <input 
  type="file"
  id="fileInput"
  multiple 
  accept="audio/*"
  onChange={handleFileChange} 
  className='chose_device_input'
/>





</label>
  


</div>
<p className='update'>"      <BsFillLockFill style={{color:"#2ecc71"}} /> Drop your audios here"</p>


</div>

  ):(

<>

{
!convertedFiles ? (

  <>
    {/* this for button add more */}
    <div className='chose_device_container  chose_device_container_section2'>
  <label htmlFor="fileInput" className="custom-button_device custom-button_device_section2">
<FaFileUpload className='  chose_files_device_icon  chose_files_device_icon_section2'/>

  Add More Audios

  <input 
  type="file"
  id="fileInput"
  multiple 
  accept="audio/*"
  onChange={handleFileChange} 
  className='chose_device_input'
/>



</label>
  


</div>



{/* this section for click convert and select all */}

{files.length > 0 && (
  <div>
   <div className='convert_section_button'>
 

<button onClick={handleFileUpload} className='button_click_convert'>Compress <BsArrowRight className='icon_convert'/></button>

</div>


  </div>
) }


{/* this section who has  file information with select */}
    {files.map((file, index) => (
  <div key={index} >

{/* this is the chosen section */}
<div className=' convert_chose_files_compress'>
<p className='convert_chose_files_name_compress '>{file.name}</p>
<div className='convert_chose_files_chose_compress'>
<AiOutlineCloseCircle  onClick={() => handleFileDelete(`${file.name}_${index}`)} className='convert_chose_files_delete' />
</div>
</div>
  </div>
))}  


    </>
):(
<div>
  
<div className='converted_convert'>
  <div className='converted_convert_more' onClick={handleOpenNewTab}>
   Convert More <BsBoxArrowUpRight className='converted_convert_more_icon'/>
  </div>
  {
  files.length > 1 &&(
  (
  downloadAll  &&  downloadValidation ? (
    <div className='converted_convert_downloadAll    downloadAll_opacity' onClick={DownloadAll}>
    Download All    <BiDownload className='  converted_convert_more_download  '/> 
    
  </div>):(
    <div className='converted_convert_downloadAll'>
    Download All    <BiDownload className='  converted_convert_more_download'/> 
    
  </div>
  )
  )
  )
  }


  </div>




{files.map((file, index) => {
  const fileName = file.name;
  const fileProgress = conversionProgress[fileName];
  
  const filteredConvertedFiles = convert.filter(
    (item) => type.includes(item.fileOutput) && item.filename === `${fileName}_${index}`
  );

  return (
    fileProgress > 0 && (
      <div key={index} className='uploading'>
        <p className='section1_uploading'>{fileName}</p>
        {filteredConvertedFiles.length > 0   ? (
          filteredConvertedFiles.map((converted, i) => {
            const outputType = converted.fileOutput;
            const totalProgress = totalConversionProgress[outputType];

            return (
              <div key={i} className='section2_uploading'>
                {totalProgress > 0 ? (
                  totalProgress >=99 ? (
                    totalProgress === 100 ? (
                      <>
                      <p className='done_converting'>Done</p>
                      {
                      downloadOne ? (
                        downloadOne1 ? (
                      <button  className='uploading_download '>Download</button>

                        ):(
                      <button  className='uploading_download download_success '>Download</button>

                        )
                      
                      ):(
                      <button onClick={() => handleDownload(converted)} className='uploading_download download_success'>Download</button>
                      
                      )
                     }
                    </>
                    ):(
                      <>
                      <div className='uploading_convert_main'>
                        <div className='progress_rate'>finishing...</div>
                        <progress max="100" value={defaultProgress} className='uploading_progress'></progress>
                      </div>
                      <button className='uploading_download'>Download</button>

                    </>
                    )
                    
                  ) : (
                    <>
                      <div className='uploading_convert_main'>
                        <div className='progress_rate'>compression {totalProgress}%</div>
                        <progress max="100" value={totalProgress} className='uploading_progress'></progress>
                      </div>
                      <button className='uploading_download'>Download</button>

                    </>
                  )
                ) : (
                  <>
                <div className='uploading_convert_main'>
                <div className='progress_rate'>compression ...</div>
                  <progress max="100" value={defaultProgress} className='uploading_progress uploading_progress1 '></progress>
                </div>
                <button className='uploading_download'>Download</button>

              </>
                )}
{/* <AiOutlineCloseCircle onClick={() => {
    handleDeleteInProgress(outputType)
    handleFileDelete(`${fileName}_${index}`);
    
    
}} className='convert_chose_files_delete' /> */}

              </div>
            );
          })
        ) : (
          <div className='section2_uploading'>
            {fileProgress === 100 ? (
              <>
                <div className='uploading_convert_main'>
                  <div className='progress_rate'>compression ...</div>
                  <progress max="100" value={defaultProgress} className='uploading_progress uploading_progress1'></progress>
                </div>
                <button className='uploading_download'>Download</button>
                {/* <button onClick={() => handleDownload(converted)} className='uploading_download download_success'>Download</button> */}

              </>
            ) : (
              <>
                <div className='uploading_convert_main'>
                  <div className='progress_rate'>Uploading {fileProgress}%</div>
                  <progress max="100" value={fileProgress} className='uploading_progress'></progress>
                </div>
                <button className='uploading_download'>Download</button>
               


              </>

            )}
                        {
                          !fileProgress > 0 && (
                            <AiOutlineCloseCircle onClick={() => handleFileDelete(`${fileName}_${index}`)} className='convert_chose_files_delete' />

                          )
                        }

          </div>
        )}

      </div>
    )
  );
})} 




</div>
)
}

</>
)
}


{/* here we have description design */}
<div className='full_section_describe'>
<div className='describe_how_convert'>
  <div className='full_how_convert'>
    <img  className='Arrows' src='/Arrows.png' alt='arrows'/>
    <h2 className='how_convert'>How to compress a audio ?</h2>
    </div>
  <p className='description_p'>1.compress your audios easily by starting with selecting them using the 'Choose Audios' button</p>
  <p className='description_p'>2.Initiate the compression  by clicking compress </p>
  <p className='description_p'>3.Once the compression is complete, click 'Download' to retrieve your compressed audios</p>
</div>

<div className='how_work_cards'>
<div className='how_work_card'>
  <div className='how_work_title'>
    <img className='image_how_work_title'src='/Simplicity.svg' alt='Simplicity'/>
    <h3 className='title_how_work_title'>Simplicity at its Core</h3>
  </div>
  <p className='how_work_description'>
  Just upload your audios and tap 'compress'. Our tool guarantees the highest quality compression. Unbeatable Features
  </p>
</div>

<div className='how_work_card'>
  <div className='how_work_title'>
    <img className='image_how_work_title'src='/programming.svg' alt='programming'/>
    <h3 className='title_how_work_title'>Unbeatable Features</h3>
  </div>
  <p className='how_work_description'>
  Effortlessly compress batches audios with our tool, which accommodates any file formats.
  </p>
</div>


<div className='how_work_card'>
  <div className='how_work_title'>
    <img className='image_how_work_title'src='/secure.svg' alt='secure'/>
    <h3 className='title_how_work_title'> Free and Secure</h3>
  </div>
  <p className='how_work_description'>
  Enjoy the benefits of a free, secure, and universally compatible tool accessible from any web browser. For added security and privacy, audios are automatically deleted after a few hours.
  </p>
</div>


</div>




</div>













</div>





<Footer/>






</div>
<title>Advanced Audio Compression Service: Enhancing Sound Quality and Efficiency</title>
        <meta name="description" content="Explore professional audio compression Service to enhance sound quality and efficiency. Learn about the latest advancements in audio compression technology and how to apply them effectively. Improve search engine visibility and user experience with expert compression strategies." />
        <meta name="keywords" content="audio compression, compression Service, sound quality, efficiency, optimization, advanced compression, codec, encoding, transcoding, streaming, bitrate, resolution, search engine optimization, SEO, user experience, professional compression, compression software, audio encoding, multimedia compression, compression algorithms" />
  
  <link rel="canonical" href="https://www.sitfile.com/compress-audio" />

    </>
    


   
  );

  
}

export default App;

