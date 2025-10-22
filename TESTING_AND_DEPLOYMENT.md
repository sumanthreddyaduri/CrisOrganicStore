# Testing and Deployment Guide

## 🧪 Testing Checklist

### Frontend Testing

#### Home Page (`/`)
- [ ] Hero section displays correctly
- [ ] Feature highlights are visible
- [ ] Featured products load
- [ ] Customer testimonials display
- [ ] CTA buttons are clickable
- [ ] Navigation links work
- [ ] Footer displays correctly
- [ ] Responsive on mobile/tablet/desktop

#### Products Page (`/products`)
- [ ] Product list loads
- [ ] Search functionality works
- [ ] Price filtering works
- [ ] Sorting options work
- [ ] Pagination works
- [ ] Stock status displays
- [ ] Add to cart button works
- [ ] Product images load

#### Product Detail Page (`/products/:id`)
- [ ] Product information displays
- [ ] Images load correctly
- [ ] Quantity selector works
- [ ] Add to cart button works
- [ ] Add to wishlist button works
- [ ] Reviews section displays
- [ ] Review form works
- [ ] Nutritional info displays

#### Shopping Cart (`/cart`)
- [ ] Cart items display
- [ ] Quantity adjustment works
- [ ] Remove item works
- [ ] Promo code application works
- [ ] Order summary calculates correctly
- [ ] Tax calculation is accurate (10%)
- [ ] Shipping cost calculation works
- [ ] Checkout button works

#### Checkout (`/checkout`)
- [ ] Step 1: Shipping form validates
- [ ] Step 2: Payment method selection works
- [ ] Step 3: Order review displays correctly
- [ ] Order summary sidebar updates
- [ ] Form navigation works (back/next)
- [ ] Order creation succeeds
- [ ] Redirect to orders page works

#### Orders Page (`/orders`)
- [ ] Order list displays
- [ ] Order status indicators show
- [ ] Order details display
- [ ] Track order button works
- [ ] Reorder button works
- [ ] Empty state displays when no orders

#### Blog Page (`/blog`)
- [ ] Blog posts load
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Article cards display
- [ ] Read more button works
- [ ] Pagination works

#### Contact Page (`/contact`)
- [ ] Contact form displays
- [ ] Form validation works
- [ ] Form submission works
- [ ] Success message displays
- [ ] Contact info cards display
- [ ] FAQ section displays
- [ ] Live chat button works

#### Authentication Pages (`/auth`, `/login`, `/register`)
- [ ] Login form displays
- [ ] Register form displays
- [ ] Form validation works
- [ ] Social login buttons work
- [ ] Password reset link works
- [ ] Remember me checkbox works
- [ ] Already logged in state displays

#### Merchant Dashboard (`/merchant`)
- [ ] Dashboard loads for authenticated users
- [ ] Overview tab displays metrics
- [ ] Products tab displays products
- [ ] Add product form works
- [ ] Edit product button works
- [ ] Delete product button works
- [ ] Orders tab displays orders
- [ ] Order status filters work

### Backend Testing

#### API Endpoints
- [ ] `GET /api/trpc/products.list` returns products
- [ ] `GET /api/trpc/products.getById` returns product details
- [ ] `POST /api/trpc/products.create` creates product
- [ ] `POST /api/trpc/cart.addItem` adds to cart
- [ ] `GET /api/trpc/cart.getItems` returns cart items
- [ ] `POST /api/trpc/orders.create` creates order
- [ ] `GET /api/trpc/orders.list` returns orders
- [ ] `POST /api/trpc/reviews.create` creates review
- [ ] `POST /api/trpc/contact.submit` submits contact form
- [ ] `POST /api/trpc/auth.logout` logs out user

#### Database
- [ ] All 12 tables exist
- [ ] Schema migrations complete
- [ ] Data persistence works
- [ ] Relationships are correct
- [ ] Constraints are enforced

#### Authentication
- [ ] OAuth login works
- [ ] Session creation works
- [ ] Session persistence works
- [ ] Logout works
- [ ] Protected procedures require auth
- [ ] User data is accessible

### Performance Testing

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Images load efficiently
- [ ] No console errors
- [ ] No memory leaks
- [ ] Responsive design works

### Security Testing

- [ ] HTTPS enforced
- [ ] Session cookies are secure
- [ ] Protected routes require auth
- [ ] Input validation works
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection

## 🚀 Deployment Steps

### Pre-Deployment Checklist

1. **Code Quality**
   ```bash
   # Run TypeScript type checking
   pnpm tsc --noEmit
   
   # Check for linting issues
   pnpm lint
   
   # Run tests (if available)
   pnpm test
   ```

2. **Environment Setup**
   - [ ] All environment variables configured
   - [ ] Database URL set correctly
   - [ ] OAuth credentials configured
   - [ ] JWT secret generated
   - [ ] API keys secured

3. **Database**
   ```bash
   # Push schema changes
   pnpm db:push
   
   # Verify migrations
   pnpm db:generate
   ```

4. **Build Verification**
   ```bash
   # Build the project
   pnpm build
   
   # Check build output
   ls -la dist/
   ```

### Deployment Platforms

#### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option 2: Docker
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Option 3: Traditional Server
1. SSH into server
2. Clone repository
3. Install dependencies: `pnpm install`
4. Build: `pnpm build`
5. Start: `pnpm start`
6. Use PM2 for process management

### Post-Deployment

1. **Verify Deployment**
   - [ ] Website loads correctly
   - [ ] All pages accessible
   - [ ] API endpoints working
   - [ ] Database connected
   - [ ] Authentication working

2. **Monitor**
   - [ ] Error tracking (Sentry)
   - [ ] Performance monitoring
   - [ ] Uptime monitoring
   - [ ] Log aggregation

3. **Backup**
   - [ ] Database backups scheduled
   - [ ] Code repository backed up
   - [ ] Assets backed up

## 📊 Performance Optimization

### Frontend Optimization
- Lazy load images
- Code splitting
- Minify CSS/JS
- Compress assets
- Cache static files
- Use CDN for assets

### Backend Optimization
- Database indexing
- Query optimization
- Caching strategies
- API response compression
- Connection pooling

### Database Optimization
- Add indexes on frequently queried columns
- Archive old data
- Optimize table structure
- Regular maintenance

## 🔍 Monitoring and Maintenance

### Key Metrics to Monitor
- Page load time
- API response time
- Error rate
- Database performance
- Server resource usage
- User engagement

### Regular Maintenance Tasks
- Update dependencies
- Security patches
- Database optimization
- Log review
- Performance analysis
- Backup verification

## 🐛 Troubleshooting

### Common Issues

**Issue: Database connection fails**
- Check DATABASE_URL
- Verify database is running
- Check network connectivity
- Verify credentials

**Issue: OAuth login not working**
- Verify OAuth credentials
- Check redirect URLs
- Verify VITE_APP_ID
- Check OAUTH_SERVER_URL

**Issue: Pages not loading**
- Check browser console for errors
- Verify API endpoints
- Check network tab
- Review server logs

**Issue: Slow performance**
- Check database queries
- Enable caching
- Optimize images
- Review server resources

## 📝 Environment Variables

Required environment variables for deployment:

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/database

# Authentication
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Application
VITE_APP_TITLE=Cris's Organic Store
VITE_APP_LOGO=https://example.com/logo.png

# Optional
OWNER_NAME=Cris
OWNER_OPEN_ID=your-owner-id
```

## 🔐 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] API keys protected
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] CORS configured
- [ ] Security headers set
- [ ] Regular security audits
- [ ] Dependency updates

## 📞 Support and Contact

For deployment support or issues:
- Email: support@crisorganic.com
- Phone: 1-800-ORGANIC
- Website: https://crisorganic.com

---

**Last Updated**: October 2025  
**Version**: 1.0.0

