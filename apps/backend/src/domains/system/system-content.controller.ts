import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Public } from '@omnistay/backend-common';
import { SystemContentService } from './system-content.service.js';
import type {
  AuditLogItem,
  CustomPageItem,
  MediaAssetItem,
  NavigationMenuItem,
  NewsArticleItem,
  PopupModalItem,
  ThemeCatalogItem,
  ThemeConfig,
  WebsiteCustomizerConfig,
} from './system-content.service.js';

@ApiTags('System & CMS - Content Management Hub')
@Controller('api/v1/system')
export class SystemContentController {
  constructor(private readonly contentService: SystemContentService) {}

  // --- News / Articles ---
  @Public()
  @Get('news')
  @ApiOperation({ summary: 'List published and draft editorial articles & news' })
  getNews(): NewsArticleItem[] {
    return this.contentService.getNewsArticles();
  }

  @Public()
  @Post('news')
  @ApiOperation({ summary: 'Publish or draft a travel article/news' })
  createNews(@Body() dto: Partial<NewsArticleItem>): NewsArticleItem {
    return this.contentService.createNewsArticle(dto);
  }

  @Public()
  @Patch('news/:id')
  @ApiOperation({ summary: 'Update editorial article/news' })
  updateNews(@Param('id') id: string, @Body() dto: Partial<NewsArticleItem>): NewsArticleItem | null {
    return this.contentService.updateNewsArticle(id, dto);
  }

  @Public()
  @Delete('news/:id')
  @ApiOperation({ summary: 'Delete article by ID' })
  deleteNews(@Param('id') id: string) {
    return { success: this.contentService.deleteNewsArticle(id) };
  }

  // --- Custom Pages ---
  @Public()
  @Get('pages')
  @ApiOperation({ summary: 'List custom CMS static pages (terms, about, legal)' })
  getPages(): CustomPageItem[] {
    return this.contentService.getPages();
  }

  @Public()
  @Get('pages/find')
  @ApiOperation({ summary: 'Get custom page by slug or id query' })
  findPage(@Query('slug') slug?: string, @Query('id') id?: string): CustomPageItem | null {
    const target = slug || id || '';
    return this.contentService.getPageByIdOrSlug(target);
  }

  @Public()
  @Get('pages/:idOrSlug')
  @ApiOperation({ summary: 'Get custom page by ID or URL slug' })
  getPageByIdOrSlug(@Param('idOrSlug') idOrSlug: string): CustomPageItem | null {
    return this.contentService.getPageByIdOrSlug(idOrSlug);
  }

  @Public()
  @Post('pages')
  @ApiOperation({ summary: 'Create custom landing or static page' })
  createPage(@Body() dto: Partial<CustomPageItem>): CustomPageItem {
    return this.contentService.createPage(dto);
  }

  @Public()
  @Patch('pages/:id')
  @ApiOperation({ summary: 'Update custom landing or static page' })
  updatePage(@Param('id') id: string, @Body() dto: Partial<CustomPageItem>): CustomPageItem | null {
    return this.contentService.updatePage(id, dto);
  }

  @Public()
  @Delete('pages/:id')
  @ApiOperation({ summary: 'Delete custom page by ID' })
  deletePage(@Param('id') id: string) {
    return { success: this.contentService.deletePage(id) };
  }

  // --- Media Library ---
  @Public()
  @Get('media')
  @ApiOperation({ summary: 'List media assets and uploaded photography' })
  getMedia(): MediaAssetItem[] {
    return this.contentService.getMediaAssets();
  }

  @Public()
  @Post('media/upload')
  @ApiOperation({ summary: 'Register uploaded media asset' })
  uploadMedia(@Body() body: { name: string; size: string; path: string }): MediaAssetItem {
    return this.contentService.uploadMediaAsset(body.name, body.size, body.path);
  }

  @Public()
  @Delete('media/:id')
  @ApiOperation({ summary: 'Delete media file from library' })
  deleteMedia(@Param('id') id: string) {
    return { success: this.contentService.deleteMediaAsset(id) };
  }

  // --- Navigation Menus ---
  @Public()
  @Get('menus')
  @ApiOperation({ summary: 'List header and footer navigation menus' })
  getMenus(@Query('location') location?: 'header' | 'footer' | 'guest'): NavigationMenuItem[] {
    return this.contentService.getMenus(location);
  }

  @Public()
  @Post('menus')
  @ApiOperation({ summary: 'Add navigation menu item' })
  createMenuItem(@Body() dto: Partial<NavigationMenuItem>): NavigationMenuItem {
    return this.contentService.createMenuItem(dto);
  }

  @Public()
  @Post('menus/reorder')
  @ApiOperation({ summary: 'Reorder navigation menus' })
  reorderMenus(@Body() body: { items: { id: string; order: number }[] }): NavigationMenuItem[] {
    return this.contentService.reorderMenus(body.items || []);
  }

  @Public()
  @Patch('menus/:id')
  @ApiOperation({ summary: 'Update navigation menu item' })
  updateMenuItem(@Param('id') id: string, @Body() dto: Partial<NavigationMenuItem>): NavigationMenuItem | null {
    return this.contentService.updateMenuItem(id, dto);
  }

  @Public()
  @Delete('menus/:id')
  @ApiOperation({ summary: 'Delete navigation menu item' })
  deleteMenuItem(@Param('id') id: string) {
    return { success: this.contentService.deleteMenuItem(id) };
  }

  // --- Popups ---
  @Public()
  @Get('popups')
  @ApiOperation({ summary: 'List active marketing popups and promo modals' })
  getPopups(): PopupModalItem[] {
    return this.contentService.getPopups();
  }

  @Public()
  @Post('popups')
  @ApiOperation({ summary: 'Create marketing popup modal' })
  createPopup(@Body() dto: Partial<PopupModalItem>): PopupModalItem {
    return this.contentService.createPopup(dto);
  }

  @Public()
  @Patch('popups/:id')
  @ApiOperation({ summary: 'Update marketing popup modal' })
  updatePopup(@Param('id') id: string, @Body() dto: Partial<PopupModalItem>): PopupModalItem | null {
    return this.contentService.updatePopup(id, dto);
  }

  @Public()
  @Patch('popups/:id/status')
  @ApiOperation({ summary: 'Toggle marketing popup active/paused status' })
  togglePopupStatus(@Param('id') id: string): PopupModalItem | null {
    return this.contentService.togglePopupStatus(id);
  }

  @Public()
  @Delete('popups/:id')
  @ApiOperation({ summary: 'Delete popup modal' })
  deletePopup(@Param('id') id: string) {
    return { success: this.contentService.deletePopup(id) };
  }

  // --- Themes ---
  @Get('themes')
  @ApiOperation({ summary: 'Get active theme and branding colors' })
  getTheme(): ThemeConfig {
    return this.contentService.getThemeConfig();
  }

  @Put('themes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update active visual theme palette and styling' })
  updateTheme(@Body() config: Partial<ThemeConfig>): ThemeConfig {
    return this.contentService.setThemeConfig(config);
  }

  @Public()
  @Get('themes/catalog')
  @ApiOperation({ summary: 'Get installed and custom themes catalog (WordPress-style)' })
  getThemeCatalog(): ThemeCatalogItem[] {
    return this.contentService.getThemeCatalog();
  }

  @Public()
  @Post('themes/catalog')
  @ApiOperation({ summary: 'Create a new custom theme from scratch (WordPress-style)' })
  createTheme(@Body() dto: Partial<ThemeCatalogItem>): ThemeCatalogItem {
    return this.contentService.createTheme(dto);
  }

  @Public()
  @Post('themes/catalog/:id/activate')
  @ApiOperation({ summary: 'Activate a theme across the website' })
  activateTheme(@Param('id') id: string) {
    return this.contentService.activateTheme(id);
  }

  @Public()
  @Post('themes/catalog/:id/duplicate')
  @ApiOperation({ summary: 'Duplicate an existing theme to customize' })
  duplicateTheme(@Param('id') id: string, @Body('name') newName?: string): ThemeCatalogItem {
    return this.contentService.duplicateTheme(id, newName);
  }

  @Public()
  @Delete('themes/catalog/:id')
  @ApiOperation({ summary: 'Delete a custom theme' })
  deleteTheme(@Param('id') id: string) {
    return { success: this.contentService.deleteTheme(id) };
  }

  // --- WordPress-Style Website Builder / Theme Customizer ---
  @Get('website-customizer')
  @ApiOperation({ summary: 'Get live website builder and theme customizer configuration' })
  getWebsiteCustomizer(): WebsiteCustomizerConfig {
    return this.contentService.getWebsiteCustomizerConfig();
  }

  @Put('website-customizer')
  @ApiOperation({ summary: 'Publish live website builder and theme customizer configuration' })
  updateWebsiteCustomizer(@Body() config: Partial<WebsiteCustomizerConfig>): WebsiteCustomizerConfig {
    return this.contentService.setWebsiteCustomizerConfig(config);
  }

  // --- Compliance & Audit Trail ---
  @Get('audit-logs')
  @ApiOperation({ summary: 'List security and administrative compliance audit trail' })
  getAuditLogs(): AuditLogItem[] {
    return this.contentService.getAuditLogs();
  }

  @Post('audit-logs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Record audit log entry' })
  createAuditLog(@Body() body: { action: string; user: string; ipAddress?: string; status?: 'SUCCESS' | 'WARNING' | 'FAILED' }): AuditLogItem {
    return this.contentService.recordAuditLog(body.action, body.user, body.ipAddress, body.status);
  }

  // --- Real-Time Multi-Currency & DCC (Chapter 6.3) ---
  @Get('exchange-rates')
  @ApiOperation({
    summary: 'Dynamic Currency Conversion Rates & 15-Minute Rate Lock Guarantee (Chapter 6.3)',
    description: 'Returns real-time forex exchange rates with a 15-minute guaranteed rate lock window for international guest checkout transparency.',
  })
  getExchangeRates() {
    return this.contentService.getExchangeRates();
  }
}
