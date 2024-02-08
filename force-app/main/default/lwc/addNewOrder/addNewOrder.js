import { LightningElement, track, wire, api } from 'lwc';
import { refreshApex } from "@salesforce/apex";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import retrieveProducts from '@salesforce/apex/addNewOrderButtonController.retrieveProducts';
import fetchProducts from '@salesforce/apex/addNewOrderButtonController.fetchProducts';
import { NavigationMixin } from 'lightning/navigation';
import getCarts from '@salesforce/apex/addNewOrderButtonController.getCarts';
import getPreviousOrders from '@salesforce/apex/addNewOrderButtonController.getPurchasedOrders';
const productColumns = [
    { label: 'Product Id', fieldName: 'Id' },
    { label: 'Name', fieldName: 'Name' },
    { label: 'Price', fieldName: 'Price__c', type: 'currency' },
    { label: 'Available Units', fieldName: 'available_units__c' },
    { label: 'Product code', fieldName: 'ProductCode' }
];
const puchasedOrdersColumns = [
    { label: 'PO Id', fieldName: 'Id' },
    { label: 'Status', fieldName: 'Status__c' },
    { label: 'Order Total', fieldName: 'order__total__c' }
];
const productCartColumns = [
    { label: 'Product Id', fieldName: 'Id' },
    { label: 'Name', fieldName: 'Name' },
    { label: 'Price', fieldName: 'Price__c', type: 'currency' },
    { label: 'Product code', fieldName: 'ProductCode' },
    { label: 'Units', type: 'number', fieldName: 'Units', editable: true },
    {
        label: 'Action',
        type: 'button-icon',
        typeAttributes: {
            iconName: 'utility:delete',
            name: 'delete',
            iconClass: 'slds-icon-text-error'
        }
    }
];
const checkoutColumns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Price', fieldName: 'Price__c', type: 'currency' },
    { label: 'Product code', fieldName: 'ProductCode' },
    { label: 'Units', type: 'number', fieldName: 'Units' },
    { label: 'total', type: 'number', fieldName: 'Units' }
];
export default class addNewOrder extends NavigationMixin(LightningElement) {
    productCartColumns = productCartColumns;
    checkoutColumns = checkoutColumns;

    invoice = true;

    //selectedCartRecords = []
    //selectedRows = [];
    //@track productColumns;
    @track boolVisible = false;
    @track boolCheckout = false;
    @track productData;
    error;
    @track selectedProducts = [];
    @track cartData = [];
    @track checkOutProducts = [];
    //selectedCartRecords;
    @track isItemInCart = false;
    @track invoice = false;

    // pgination variables

    //@track records = [];
    totalRecords; //Total no.of records
    pageSize = 10; //No.of records to be displayed per page
    totalPages; //Total no.of pages
    pageNumber = 1; //Page number    


    get bDisableFirst() {
        return this.pageNumber == 1;
    }
    get bDisableLast() {
        return this.pageNumber == this.totalPages;
    }


    handleRecordsPerPage(event) {
        this.pageSize = event.target.value;
        this.paginationHelper();
    }
    previousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
    }
    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
    }
    firstPage() {
        this.pageNumber = 1;
        this.paginationHelper();
    }
    lastPage() {
            this.pageNumber = this.totalPages;
            this.paginationHelper();
        }
        // JS function to handel pagination logic 
    paginationHelper() {
        this.productData = [];
        // calculate total pages
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        // set page number 
        if (this.pageNumber <= 1) {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        // set records to display on current page 
        for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
            if (i === this.totalRecords) {
                break;
            }
            this.productData.push(this.records[i]);

        }
    }
    @wire(retrieveProducts)
    wiredProducts({ error, data }) {
        if (data) {
            this.records = data;
            this.totalRecords = data.length;
            console.log(this.totalRecords);
        } else if (error) {
            this.error = error;
            // Handle error
        }
    }

    showNewOrderTable() {
        this.boolVisible = true;
        this.productColumns = productColumns;
        this.paginationHelper();
    }



    handleKeyChange(event) {
        const searchKey = event.target.value;
        if (searchKey) {
            fetchProducts({ searchKey }).then(result => {
                    this.productData = result;
                })
                .catch(error => {
                    this.error = error;
                });
        }
    }
    showCart() {
        if (this.isItemInCart === true) {
            this.isItemInCart = false;
        } else {
            this.isItemInCart = true;
        }
    }
    addCartSection() {

        //var selectedRecords = this.template.querySelector("lightning-datatable").getSelectedRows();
        this.selectedProducts.forEach(selectedProduct => {
            let existingProductIndex = this.cartData.findIndex(product => product.Id === selectedProduct.Id);

            if (existingProductIndex !== -1) {
                if (this.productData.find(item => item.Id === selectedProduct.Id).available_units__c > this.cartData[existingProductIndex].Units) {
                    this.cartData[existingProductIndex].Units++;
                }
                // If the product is already in the cart, increase the unit count by one
            } else {
                // If the product is not in the cart, add it with unit count of one
                let newProduct = {
                    Id: selectedProduct.Id,
                    Name: selectedProduct.Name,
                    Price__c: selectedProduct.Price__c,
                    ProductCode: selectedProduct.ProductCode,
                    Units: 1
                };
                this.cartData.push(newProduct);
            }
            selectedProduct.available_units__c--;
            // Check if the product is already in the cart

        });

        // Clear the selectedProducts array after adding them to the cart

        this.selectedProducts = [];
        // alert(this.selectedRows.length)
        //alert(selectedRecords);
        this.boolVisible = true;
        this.isItemInCart = true;

    }
    handleRowSelected(event) {
        const selectedRows = event.detail.selectedRows;

        // Update the selectedProducts list
        this.selectedProducts = selectedRows;

    }
    draftValues = [];
    productData1 = this.productData;
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'delete':
                this.removeProductFromCart(row);
                break;
            default:
                break;
        }
    }
    removeProductFromCart(row) {
        const productId = row.Id;
        const productIndex = this.cartData.findIndex(product => product.Id === productId);
        if (productIndex !== -1) {
            // Remove the product from the cartData array
            this.cartData.splice(productIndex, 1);
            this.cartData = [...this.cartData];

            // Show success toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Product removed from cart',
                    variant: 'success',
                })
            );
        }
    }
    async handleSave(event) {
        // console.log(event);
        // console.log(event.detail.draftValues);
        // Extract productId numbers from draftValues
        const record = event.detail.draftValues.slice().map((draftValue) => {
            const fields = Object.assign({}, draftValue);
            console.log(fields);
            return { fields };
        });
        console.log(record);
        event.detail.draftValues.forEach(data => {
            let recordItemAvailableUnits = this.productData.find(item => item.Id === data.Id).available_units__c;
            let cartItemUnits = this.cartData.find(item => item.Id === data.Id).Units;
            // Find the corresponding record in cartData array by ID
            if (recordItemAvailableUnits >= data.Units && data.Units > 0) {
                cartItemUnits = data.Units;

                recordItemAvailableUnits = recordItemAvailableUnits - data.Units;

            } else if (recordItemAvailableUnits < data.Units) {
                cartItemUnits = recordItemAvailableUnits;
                recordItemAvailableUnits = 0;
            } else {
                cartItemUnits = 1;
                recordItemAvailableUnits = recordItemAvailableUnits - 1;
            }
            this.cartData.find(item => item.Id === data.Id).Units = cartItemUnits;

            //this.productData.find(item => item.Id === data.Id).available_units__c = recordItemAvailableUnits;

        });
        this.draftValues = [];

        try {
            // Display fresh data in the datatable
            await refreshApex(this.cartData);
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error updating or reloading products",
                    message: error.body.message,
                    variant: "error",
                }),
            );
        }

        // Update cartData to trigger reactivity
        // Update cartData to trigger reactivity
        this.cartData = [...this.cartData];
    }

    onCheckout() {
        console.log(this.cartData.length);
        randomInvoiceNumber = Math.floor(Math.random() * 10000); // Generate a random invoice number
        createdDate = new Date().toLocaleDateString();
        this.cartData.forEach(item => {
            const newItem = {
                Name: item.Name,
                Price__c: item.Price__c,
                ProductCode: item.ProductCode,
                Units: item.Units,
                Units: item.Units
            };
            this.checkOutProducts.push(newItem);
        });
        if (this.invoice) {
            this.invoice = true;
        } else {
            this.invoice = false;
        }
    }

}