import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import React from 'react'

const layout = ({children}: Readonly<{children: React.ReactNode;}>) => {
  return (
    <AuthProvider>
    <div>
      <Navbar />  
      {children}
    </div>
    </AuthProvider>
  )
}

export default layout
