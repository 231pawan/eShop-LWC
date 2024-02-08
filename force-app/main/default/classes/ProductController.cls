public with sharing class ProductController {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProducts() {
        // Implement logic to fetch and return a list of Product__c records
        return [SELECT Id, Name, Price__c FROM Product2];
    }
}