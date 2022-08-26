/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js"
import store from "../__mocks__/store.js"
import '@testing-library/jest-dom/extend-expect'

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //verifier que la classe active sur l'element est "active-icon"
      expect(windowIcon.className).toBe("active-icon")
    })
    //test du tri par ordre de création du plus récents aux plus anciens
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    //tester le fetch du GET
    test("fetches bills from mock API GET", async () =>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const btnNewBill = await screen.getByTestId('btn-new-bill')
      expect(btnNewBill).toBeTruthy()
      const tBody = await screen.getByTestId('tbody')
      expect(tBody).toBeTruthy()
    }) 
    //test de la création des notes de frais existantes
    test("bills should be create",()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      store.bills = jest.fn().mockImplementationOnce(() => {
        return {
          list: jest.fn().mockResolvedValue([{  
              date:"2021-11-02"
          }])
        }
      })
      const bills = new Bills({ document, onNavigate, store:store, localStorage:window.localStorage})
      const res = bills.getBills()
      expect(res).toEqual(Promise.resolve({}))
    })
    //test de l'envoie d'un message d'erreur en cas de datatime erroné
    test("bills should send a data invalide value",()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      store.bills = jest.fn().mockImplementationOnce(() => {
        return {
          list: jest.fn().mockResolvedValue([{  
              date:""
          }])
        }
      })
      const bills = new Bills({ document, onNavigate, store:store, localStorage:window.localStorage})
      const res = bills.getBills()
      expect(res).toEqual(Promise.resolve({}))
    })
    //Test de l'ouverture du formulaire newbill
    describe(`When i click on "newBill"`,()=>{
      test("show form newBill",async ()=>{
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => screen.getByText("Mes notes de frais"))
        const btnNewBill = await screen.getByTestId('btn-new-bill')
        const bills = new Bills({ document, onNavigate, store:null, localStorage:window.localStorage})
        const handleClickNewBill = jest.fn((e) => bills.handleClickNewBill())
        btnNewBill.addEventListener('click', handleClickNewBill)
        userEvent.click(btnNewBill)
        await waitFor(()=>screen.getByText("Envoyer une note de frais"))
        const formNewBill = await screen.getByTestId('form-new-bill')
        expect(formNewBill).toBeTruthy()
      })
    })
  })
})

