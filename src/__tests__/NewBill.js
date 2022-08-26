/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {fireEvent, getAllByDisplayValue, screen, waitFor} from "@testing-library/dom"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from '../__mocks__/localStorage'
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import store from "../__mocks__/store.js"


Object.defineProperty(window, 'LocalStorage', {value: localStorageMock})
window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form is rendered",async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      await waitFor(() => screen.getByText('Envoyer une note de frais'))
      const sendBill = screen.getByText('Envoyer une note de frais')
      expect(sendBill).toBeTruthy
    })
  })
  describe("When I am on NewBill Page",()=>{
    test("Then, a file should be upload with a good format",()=>{
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };     
      const newBill = new NewBill({ document, onNavigate, store, localStorage:window.localStorage})
      const inputFile = screen.getByTestId('file')
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      expect(handleChangeFile).toBeTruthy()
      inputFile.addEventListener("change",handleChangeFile)
      const imgToUpload  = new File(['testImage.png'], 'testImage.png', {type: 'image/png'})
      fireEvent.change(inputFile, {target:{files: [imgToUpload]}})
      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile.files[0].name).toBe("testImage.png")
    })
  })
})
