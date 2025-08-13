import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_319)">
                  <path
                    d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7033 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                    fill="currentColor"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_319"><rect width="48" height="48" fill="white"></rect></clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">EduPay</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-[#0d141c] text-sm font-medium leading-normal" href="#features">Features</a>
              <a className="text-[#0d141c] text-sm font-medium leading-normal" href="#pricing">Pricing</a>
              <a className="text-[#0d141c] text-sm font-medium leading-normal" href="#about">About</a>
            </div>
            <div className="flex gap-2">
              <Link
                to="/auth/login"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d78f2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#0d68d2] transition-colors"
              >
                <span className="truncate">Sign In</span>
              </Link>
              <Link
                to="/auth/register"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d7dde4] transition-colors"
              >
                <span className="truncate">Sign Up</span>
              </Link>
            </div>
          </div>
        </header>
        
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="flex flex-col gap-6 px-4 py-10 @[480px]:gap-8 @[864px]:flex-row">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg @[480px]:h-auto @[480px]:min-w-[400px] @[864px]:w-full"
                  style={{backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")'}}
                ></div>
                <div className="flex flex-col gap-6 @[480px]:min-w-[400px] @[480px]:gap-8 @[864px]:justify-center">
                  <div className="flex flex-col gap-2 text-left">
                    <h1
                      className="text-[#0d141c] text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]"
                    >
                      Simplify school payments and student management
                    </h1>
                    <h2 className="text-[#0d141c] text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      Track tuition, manage fees, and keep student data organized — anytime, anywhere
                    </h2>
                  </div>
                  <Link
                    to="/auth/register"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#0d78f2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-[#0d68d2] transition-colors"
                  >
                    <span className="truncate">Get Started</span>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-10 px-4 py-10 @container" id="features">
              <div className="flex flex-col gap-4">
                <h1
                  className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
                >
                  Key Benefits
                </h1>
                <p className="text-[#0d141c] text-base font-normal leading-normal max-w-[720px]">
                  EduPay offers a comprehensive solution to streamline school payments and student management, saving you time and improving efficiency.
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-0">
                <div className="flex flex-1 gap-3 rounded-lg border border-[#cedae8] bg-slate-50 p-4 flex-col">
                  <div className="text-[#0d141c]" data-icon="CreditCard" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64Zm0,128H32V104H224v88Zm-16-24a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h32A8,8,0,0,1,208,168Zm-64,0a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,168Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#0d141c] text-base font-bold leading-tight">Automated Payment Tracking</h2>
                    <p className="text-[#49709c] text-sm font-normal leading-normal">
                      Automatically track payments, send reminders, and generate reports. Reduce manual work and improve cash flow.
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#cedae8] bg-slate-50 p-4 flex-col">
                  <div className="text-[#0d141c]" data-icon="Users" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#0d141c] text-base font-bold leading-tight">All-in-One Student Management</h2>
                    <p className="text-[#49709c] text-sm font-normal leading-normal">
                      Manage student profiles, attendance, grades, and communication in one place. Streamline administrative tasks.
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#cedae8] bg-slate-50 p-4 flex-col">
                  <div className="text-[#0d141c]" data-icon="ShieldCheck" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M208,40H48A16,16,0,0,0,32,56v58.78c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#0d141c] text-base font-bold leading-tight">Secure &amp; Compliant</h2>
                    <p className="text-[#49709c] text-sm font-normal leading-normal">Ensure data security and compliance with industry standards. Protect sensitive information.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-10 px-4 py-10 @container">
              <div className="flex flex-col gap-4">
                <h1
                  className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
                >
                  Product Features
                </h1>
                <p className="text-[#0d141c] text-base font-normal leading-normal max-w-[720px]">
                  Explore the key features of EduPay that make school payments and student management easier than ever.
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
                <div className="flex flex-col gap-3 pb-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                    style={{backgroundImage: 'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")'}}
                  ></div>
                  <div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal">Intuitive Dashboard</p>
                    <p className="text-[#49709c] text-sm font-normal leading-normal">Get a clear overview of payments, balances, and student activity at a glance.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pb-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                    style={{backgroundImage: 'url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")'}}
                  ></div>
                  <div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal">Comprehensive Student Profiles</p>
                    <p className="text-[#49709c] text-sm font-normal leading-normal">Manage student information, academic records, and communication history in one place.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pb-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                    style={{backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")'}}
                  ></div>
                  <div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal">Detailed Payment Reports</p>
                    <p className="text-[#49709c] text-sm font-normal leading-normal">Generate detailed reports on payments, outstanding balances, and financial performance.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Testimonials</h2>
            <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-stretch p-4 gap-3">
                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                    style={{backgroundImage: 'url("https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")'}}
                  ></div>
                  <div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal">
                      "EduPay has transformed our payment process. We've seen a significant reduction in late payments and administrative overhead."
                    </p>
                    <p className="text-[#49709c] text-sm font-normal leading-normal">Sarah Chen, School Administrator</p>
                  </div>
                </div>
                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                    style={{backgroundImage: 'url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")'}}
                  ></div>
                  <div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal">
                      "The student management features are incredibly helpful. We can easily track student progress and communicate with parents."
                    </p>
                    <p className="text-[#49709c] text-sm font-normal leading-normal">David Lee, School Principal</p>
                  </div>
                </div>
                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                    style={{backgroundImage: 'url("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")'}}
                  ></div>
                  <div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal">
                      "I love how easy it is to manage grades and attendance. EduPay has made my job so much simpler."
                    </p>
                    <p className="text-[#49709c] text-sm font-normal leading-normal">Emily Wong, Teacher</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="@container">
              <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
                <div className="flex flex-col gap-2 text-center">
                  <h1
                    className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
                  >
                    Ready to simplify your school payments and student management?
                  </h1>
                  <p className="text-[#0d141c] text-base font-normal leading-normal max-w-[720px]">Get started with EduPay today and experience the difference.</p>
                </div>
                <div className="flex flex-1 justify-center">
                  <div className="flex justify-center">
                    <Link
                      to="/auth/register"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#0d78f2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow hover:bg-[#0d68d2] transition-colors"
                    >
                      <span className="truncate">Get Started</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="flex justify-center">
          <div className="flex max-w-[960px] flex-1 flex-col">
            <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
              <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                <a className="text-[#49709c] text-base font-normal leading-normal min-w-40" href="#">Privacy Policy</a>
                <a className="text-[#49709c] text-base font-normal leading-normal min-w-40" href="#">Terms of Service</a>
                <a className="text-[#49709c] text-base font-normal leading-normal min-w-40" href="#">Contact Us</a>
              </div>
              <p className="text-[#49709c] text-base font-normal leading-normal">© 2024 EduPay. All rights reserved.</p>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
