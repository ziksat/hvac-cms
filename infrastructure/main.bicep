// Main Bicep template for HVAC CMS infrastructure
// Deploys all required Azure resources

targetScope = 'resourceGroup'

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Base name for all resources')
param baseName string = 'hvaccms'

@description('SQL Server administrator login')
@secure()
param sqlAdminLogin string

@description('SQL Server administrator password')
@secure()
param sqlAdminPassword string

// Generate unique names
var uniqueSuffix = uniqueString(resourceGroup().id)
var appServicePlanName = '${baseName}-plan-${environment}'
var backendAppName = '${baseName}-api-${environment}-${uniqueSuffix}'
var frontendAppName = '${baseName}-web-${environment}-${uniqueSuffix}'
var sqlServerName = '${baseName}-sql-${environment}-${uniqueSuffix}'
var sqlDatabaseName = '${baseName}-db'
var storageAccountName = '${baseName}stor${environment}${uniqueSuffix}'
var signalRName = '${baseName}-signalr-${environment}'
var communicationServiceName = '${baseName}-comm-${environment}'
var mapsAccountName = '${baseName}-maps-${environment}'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: environment == 'prod' ? 'P1v3' : 'B1'
    tier: environment == 'prod' ? 'PremiumV3' : 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// Backend App Service
resource backendApp 'Microsoft.Web/sites@2022-09-01' = {
  name: backendAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: environment == 'prod'
      cors: {
        allowedOrigins: [
          'https://${frontendAppName}.azurewebsites.net'
          'http://localhost:3000'
        ]
      }
      appSettings: [
        {
          name: 'NODE_ENV'
          value: environment == 'prod' ? 'production' : 'development'
        }
        {
          name: 'DATABASE_URL'
          value: 'sqlserver://${sqlServer.properties.fullyQualifiedDomainName}:1433;database=${sqlDatabaseName};user=${sqlAdminLogin};password=${sqlAdminPassword};encrypt=true;trustServerCertificate=false'
        }
        {
          name: 'AZURE_STORAGE_CONNECTION_STRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'AZURE_SIGNALR_CONNECTION_STRING'
          value: signalRService.listKeys().primaryConnectionString
        }
        {
          name: 'AZURE_MAPS_SUBSCRIPTION_KEY'
          value: mapsAccount.listKeys().primaryKey
        }
      ]
    }
  }
}

// Frontend App Service
resource frontendApp 'Microsoft.Web/sites@2022-09-01' = {
  name: frontendAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: environment == 'prod'
      appSettings: [
        {
          name: 'NEXT_PUBLIC_API_URL'
          value: 'https://${backendAppName}.azurewebsites.net/api'
        }
        {
          name: 'NEXT_PUBLIC_AZURE_MAPS_KEY'
          value: mapsAccount.listKeys().primaryKey
        }
      ]
    }
  }
}

// Azure SQL Server
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
  }
}

// Azure SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  sku: {
    name: environment == 'prod' ? 'S1' : 'Basic'
    tier: environment == 'prod' ? 'Standard' : 'Basic'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: environment == 'prod' ? 268435456000 : 2147483648
  }
}

// SQL Server Firewall Rule - Allow Azure Services
resource sqlFirewallRule 'Microsoft.Sql/servers/firewallRules@2022-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: take(replace(storageAccountName, '-', ''), 24)
  location: location
  sku: {
    name: environment == 'prod' ? 'Standard_GRS' : 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

// Blob Container for file uploads
resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  name: '${storageAccount.name}/default/hvac-files'
  properties: {
    publicAccess: 'None'
  }
}

// Azure SignalR Service
resource signalRService 'Microsoft.SignalRService/signalR@2022-02-01' = {
  name: signalRName
  location: location
  sku: {
    name: environment == 'prod' ? 'Standard_S1' : 'Free_F1'
    tier: environment == 'prod' ? 'Standard' : 'Free'
    capacity: 1
  }
  properties: {
    features: [
      {
        flag: 'ServiceMode'
        value: 'Default'
      }
    ]
    cors: {
      allowedOrigins: ['*']
    }
  }
}

// Azure Communication Services
resource communicationService 'Microsoft.Communication/communicationServices@2023-03-31' = {
  name: communicationServiceName
  location: 'global'
  properties: {
    dataLocation: 'United States'
  }
}

// Azure Maps Account
resource mapsAccount 'Microsoft.Maps/accounts@2023-06-01' = {
  name: mapsAccountName
  location: 'global'
  sku: {
    name: environment == 'prod' ? 'G2' : 'G2'
  }
  kind: 'Gen2'
}

// Outputs
output backendAppUrl string = 'https://${backendApp.properties.defaultHostName}'
output frontendAppUrl string = 'https://${frontendApp.properties.defaultHostName}'
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output storageAccountName string = storageAccount.name
output signalRHostName string = signalRService.properties.hostName
output mapsAccountName string = mapsAccount.name
output communicationServiceName string = communicationService.name
