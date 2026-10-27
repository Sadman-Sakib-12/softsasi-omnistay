import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { SystemContentService } from './system-content.service.js';
import type {
  AuditLogItem,
  CustomPageItem,
  MediaAssetItem,
  NavigationMenuItem,
  NewsArticleItem,
  PopupModalItem,
  ThemeConfig,
} from './system-content.service.js';

@ApiTags('System & CMS - Content Management Hub')
@Controller('api/v1/system')
export class SystemContentController {
  constructor(private readonly contentService: SystemContentService) {}

  // --- News / Articles ---
  @Get('news')
  @ApiOperation({ summary: 'List published and draft editorial articles & news' })
  getNews(): NewsArticleItem[] {
    return this.contentService.getNewsArticles();
  }

  @Post('news')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Publish or draft a travel article/news' })
  createNews(@Body() dto: Partial<NewsArticleItem>): NewsArticleItem {
    return this.contentService.createNewsArticle(dto);
  }

  @Delete('news/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete article by ID' })
  deleteNews(@Param('id') id: string) {
    return { success: this.contentService.deleteNewsArticle(id) };
  }

  // --- Custom Pages ---
  @Get('pages')
  @ApiOperation({ summary: 'List custom CMS static pages (terms, about, legal)' })
  getPages(): CustomPageItem[] {
    return this.contentService.getPages();
  }

  @Post('pages')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create custom landing or static page' })
  createPage(@Body() dto: Partial<CustomPageItem>): CustomPageItem {
    return this.contentService.createPage(dto);
  }

  @Delete('pages/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete custom page by ID' })
  deletePage(@Param('id') id: string) {
    return { success: this.contentService.deletePage(id) };
  }

  // --- Media Library ---
  @Get('media')
  @ApiOperation({ summary: 'List media assets and uploaded photography' })
  getMedia(): MediaAssetItem[] {
    return this.contentService.getMediaAssets();
  }

  @Post('media/upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register uploaded media asset' })
  uploadMedia(@Body() body: { name: string; size: string; path: string }): MediaAssetItem {
    return this.contentService.uploadMediaAsset(body.name, body.size, body.path);
  }

  @Delete('media/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete media file from library' })
  deleteMedia(@Param('id') id: string) {
    return { success: this.contentService.deleteMediaAsset(id) };
  }

  // --- Navigation Menus ---
  @Get('menus')
  @ApiOperation({ summary: 'List header and footer navigation menus' })
  getMenus(): NavigationMenuItem[] {
    return this.contentService.getMenus();
  }

  @Post('menus')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add navigation menu item' })
  createMenuItem(@Body() dto: Partial<NavigationMenuItem>): NavigationMenuItem {
    return this.contentService.createMenuItem(dto);
  }

  @Delete('menus/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete navigation menu item' })
  deleteMenuItem(@Param('id') id: string) {
    return { success: this.contentService.deleteMenuItem(id) };
  }

  // --- Popups ---
  @Get('popups')
  @ApiOperation({ summary: 'List active marketing popups and promo modals' })
  getPopups(): PopupModalItem[] {
    return this.contentService.getPopups();
  }

  @Post('popups')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create marketing popup modal' })
  createPopup(@Body() dto: Partial<PopupModalItem>): PopupModalItem {
    return this.contentService.createPopup(dto);
  }

  @Patch('popups/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle marketing popup active/paused status' })
  togglePopupStatus(@Param('id') id: string): PopupModalItem | null {
    return this.contentService.togglePopupStatus(id);
  }

  @Delete('popups/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
}
