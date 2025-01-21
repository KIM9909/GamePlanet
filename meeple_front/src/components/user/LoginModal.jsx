import React, {useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, setModalOpen } from "../../sources/api/store/slices/UserSlice";
import { Dialog } from "@headlessui/react";
import { X } from 'lucide-react'

const LoginModal = () => {
  const dispatch = useDispatch()
  const {isModalOpen, isLoading, error} = useSelector((state) => state.user)
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(loginUser(credentials))
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  return (
    <Dialog
      open={isModalOpen}
      onClose={() => dispatch(setModalOpen(false))}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium">로그인</Dialog.Title>
            <button
              onClick={() => dispatch(setModalOpen(false))}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={credentials.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={credentials.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default LoginModal;