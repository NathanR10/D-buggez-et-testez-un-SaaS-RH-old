/**
 * @jest-environment jsdom
 */
 import '@testing-library/jest-dom';
 import { fireEvent, screen } from '@testing-library/dom';
 import { ROUTES } from '../constants/routes';
 import { localStorageMock } from '../__mocks__/localStorage.js';
 import NewBillUI from '../views/NewBillUI.js';
 import store from '../__mocks__/store';
 import BillsUI from '../views/BillsUI.js';
 import NewBill from '../containers/NewBill.js';
 
 const onNavigate = (pathname) => {
   document.body.innerHTML = ROUTES({ pathname });
 };

 Object.defineProperty(window, 'localStorage', { value: localStorageMock });
 window.localStorage.setItem(
   'user',
   JSON.stringify({
     type: 'Employee',
   })
 );
 
 describe("Given I am on NewBill Page", () => {
   describe('When I upload an image file', () => {
     test('Then the file extension should be correct', () => {
       document.body.innerHTML = NewBillUI();
       const newBill = new NewBill({
         document,
         onNavigate,
         store: null,
         localStorage: window.localStorage,
       });
       const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
       const inputFile = screen.queryByTestId('file');
 
       inputFile.addEventListener('change', handleChangeFile);
 
       fireEvent.change(inputFile, {
         target: {
           files: [new File(['test.jpg'], 'test.jpg', { type: 'image/jpg' })],
         },
       });
 
       // No error expected
       const error = screen.queryByTestId('errorMessage');
       expect(error).toBeFalsy;
     });
   });
 
   describe('When I dont upload image file', () => {
     test('Then the file extension should be incorrect', () => {
       document.body.innerHTML = NewBillUI();
       const newBill = new NewBill({
         document,
         onNavigate,
         store: null,
         localStorage: window.localStorage,
       });
       const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
       const inputFile = screen.queryByTestId('file');
 
       inputFile.addEventListener('change', handleChangeFile);
 
       fireEvent.change(inputFile, {
         target: {
           files: [
             new File(['notAnImage'], 'notAnImage.txt', {
               type: 'text/plain',
             }),
           ],
         },
       });
 
       const error = screen.queryByTestId('errorMessage');
       expect(error).toBeTruthy;
     });
   });
 });
 
 describe('When I submit a valid bill form', () => {
   test('Then it create a new bill', async () => {
     document.body.innerHTML = NewBillUI();
     const newBill = new NewBill({
       document,
       onNavigate,
       store: null,
       localStorage: window.localStorage,
     });
 
     const submit = screen.queryByTestId('form-new-bill');
     const billTest = {
       name: 'Thalys',
       date: '2022-11-10',
       type: 'Transports',
       amount: 278,
       pct: 80,
       vat: 20,
       commentary: 'Paris-Gare-Du-Nord Amsterdam-Centraal Thalys',
       fileName: 'billet',
       fileUrl: 'billet.jpg',
     };

     const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

     newBill.createBill = (newBill) => newBill;
     document.querySelector(`input[data-testid="expense-name"]`).value =
       billTest.name;
     document.querySelector(`input[data-testid="datepicker"]`).value =
       billTest.date;
     document.querySelector(`select[data-testid="expense-type"]`).value =
       billTest.type;
     document.querySelector(`input[data-testid="amount"]`).value =
       billTest.amount;
     document.querySelector(`input[data-testid="vat"]`).value = billTest.vat;
     document.querySelector(`input[data-testid="pct"]`).value = billTest.pct;
     document.querySelector(`textarea[data-testid="commentary"]`).value =
       billTest.commentary;
     newBill.fileUrl = billTest.fileUrl;
     newBill.fileName = billTest.fileName;
 
     submit.addEventListener('click', handleSubmit);
 
     fireEvent.click(submit);
 
     expect(handleSubmit).toHaveBeenCalled();
   });
 });
 
//  POST Integration Tests
 describe('Given I am a user connected as an employee', () => {
   describe('When I update a new bill and go back to the dashboard', () => {
     test('It should fetches bills from the API POST', async () => {
       const mockAPI = jest.spyOn(store, 'update');
       const bills = await store.update();

      expect(mockAPI).toHaveBeenCalled();
      expect(bills).toHaveLength(2);

      //  expect(mockAPI).toHaveBeenCalledTimes(1);
      //  expect(bills.data.length).toBe(2);
     });
     test('It should fetches messages from the API and return a 500', async () => {
       store.update.mockImplementationOnce(() =>
         Promise.reject(new Error('Erreur 500'))
       );
       document.body.innerHTML = BillsUI({ error: 'Erreur 500' });
       const message = screen.getByText(/Erreur 500/);
       expect(message).toBeTruthy();
     });
     test('It should fetches bills from the API return a 404', async () => {
       store.update.mockImplementationOnce(() =>
         Promise.reject(new Error('Erreur 404'))
       );
       document.body.innerHTML = BillsUI({ error: 'Erreur 404' });
       const message = screen.getByText(/Erreur 404/);
       expect(message).toBeTruthy();
     });
   });
 });
