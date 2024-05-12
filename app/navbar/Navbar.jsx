"use client"
import Link from 'next/link';
import React, { useState  , useEffect} from 'react';
import { FaAngleDown, FaAngleUp  } from 'react-icons/fa';
import Phone from './phone';
import './Navbar.css'
function Navbar() {
  const [showConvert , setShowConvert] = useState(false)
  const handleConvertClick  = ()  =>{
    setShowConvert(!showConvert)
  }


 



  const [showCompress , setShowCompress] = useState(false)
  const handleCompresstClick  = ()  =>{
    setShowCompress(!showCompress)
  }






const handleClickOutside  = (event) =>{
  if(!event.target.closest('.convert_container')){
    setShowConvert(false)

  }


  if(!event.target.closest('.compress_container')){
    setShowCompress(false)

  }

}


  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <>
    <div className='navbar'>
      <div className='navbar_container'>
        <div className="image_container">
          <img src='/sitfile_logo1.svg' alt='sitfile_logo' className='navbar_image'/>
        </div>
      

        <div className="link_container">
         


          <div className="convert_container">
            <div className='convert_p' onClick={handleConvertClick}>
            <p className='convert_p_p'>Convert</p> 
            {
              showConvert ? (
           <FaAngleUp className='convert_ico_show'/>

              ):(
           <FaAngleDown className='convert_ico'/>

              )
            }
            </div>
            {
              showConvert && (
                <ul className='convert_container-links'>
              <Link href='https://webhived.com/about-us.html' className='navbar_url'>Image Converter</Link>
              <Link href='https://webhived.com/about-us.html' className='navbar_url'>Document Converter</Link>
              <Link href='https://webhived.com/about-us.html' className='navbar_url'>PDF Converter</Link>
              <Link href='https://webhived.com/about-us.html' className='navbar_url'>Video Converter</Link>
              <Link href='https://webhived.com/about-us.html' className='navbar_url'>Audio Converter</Link>

            </ul>
              )
            }
            
          </div>








          <div className="compress_container">
            <div className='convert_p' onClick={handleCompresstClick}>
            <p className='convert_p_p'>Compress</p> 
            {
              showCompress ? (
           <FaAngleUp className='convert_ico_show'/>

              ):(
           <FaAngleDown className='convert_ico'/>

              )
            }
            </div>
            {
              showCompress && (
                <ul className='compress_container-links'>
              <Link href='https://webhived.com/about-us.html' className='navbar_url'>Image Compressor</Link>
              <Link href='https://webhived.com/about-us.html' className='navbar_url'>PDF Compressor</Link>
              <Link href='https://webhived.com/about-us.html' className='navbar_url'>Video Compressor</Link>
              <Link href='https://webhived.com/about-us.html' className='navbar_url'>Audio Compressor</Link>

            </ul>
              )
            }
            
          </div>





        </div>


        <div className="register_container">
          <button className='login'>LogIn</button>
          <button className='signup'>Sign Up</button>

        </div>




      </div>


    </div>

    <Phone/>
    </>
    
  )
}

export default Navbar

