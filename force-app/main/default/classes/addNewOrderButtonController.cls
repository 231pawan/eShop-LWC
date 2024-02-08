public with sharing class addNewOrderButtonController {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getCarts(){
        List<Product2> product = [select id, name, Price__c, productCode from Product2];
        return product;
    }
    @AuraEnabled(cacheable = true)
    public static List<PurchaseOrder__c> getPurchasedOrders(){
            List<PurchaseOrder__c> purchasedOrdersList = [SELECT Id, Status__c, Order_Total__c FROM PurchaseOrder__c];
            return purchasedOrdersList;
    }
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProducts( Integer pageNumber){
        Integer offset = (pageNumber - 1) * 10; 
        List<Product2> product = [select id, name, Price__c, productCode, available_units__c  from Product2];
        return product;
    }
    @AuraEnabled(cacheable=true)
    public static List<Product2> fetchProducts(String searchKey){
        String keystr = '%'+searchKey+'%';
        return [select id, name, Price__c, productCode, available_units__c from Product2 WHERE Name LIKE: keystr];
    }
    @AuraEnabled (cacheable=true)
        public static List<Product2> retrieveProducts(){
            List<Product2> product = [select id, name, Price__c, productCode, available_units__c from Product2];
            return product;
        }
    
}
