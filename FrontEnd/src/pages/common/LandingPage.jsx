/* eslint-disable no-unused-vars */
import React from 'react'
import Header from '../../components/LandingPage/Header'
import TopNav from '../../components/LandingPage/TopNav'
import { Carasoul } from '../../components/LandingPage/Carasoul'
import MiddleBarOnCarasoul from '../../components/LandingPage/MiddleBarOnCarasoul'
import ThirdSection from '../../components/LandingPage/ThirdSection'
import Footer from '../../components/LandingPage/Footer'

const LandingPage = () => {
  return (
    <>
      <Header />
      <TopNav />
      <Carasoul />
      <ThirdSection />
      <Footer />
    </>
  )
}

export default LandingPage