import { LightningElement, wire, track } from 'lwc';
import getProducts from '@salesforce/apex/ProductController.getProducts';

const productColumns = [
    { label: 'Product Id', fieldName: 'Id' },
    { label: 'Name', fieldName: 'Name' },
    { label: 'Price', fieldName: 'Price__c', type: 'currency' }
];

const selectedProductColumns = [
    { label: 'Product Id', fieldName: 'Id', editable: false },
    { label: 'Name', fieldName: 'Name', editable: false },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: false },
    { label: 'Units', fieldName: 'Units', type: 'number', editable: true }
];

export default class ProductSelector extends LightningElement {
    @track products = [];
    @track selectedProducts = [];

    @wire(getProducts)
    wiredProducts({ error, data }) {
        if (data) {
            this.products = data.map(product => ({...product, Units: 1 }));
        } else if (error) {
            // Handle error
        }
    }

    handleRowSelected(event) {
        // Update selectedProducts based on the selected rows
        this.selectedProducts = event.detail.selectedRows.map(product => ({...product, Units: 1 }));
    }

    handleUnitsChanged(event) {
        // Handle changes to the Units field in the selected products table
        const updatedFields = event.detail.draftValues;
        this.selectedProducts = this.selectedProducts.map(product => {
            const updatedField = updatedFields.find(field => field.Id === product.Id);
            if (updatedField) {
                product.Units = updatedField.Units;
            }
            return product;
        });
    }
}