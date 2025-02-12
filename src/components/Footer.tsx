'use client'

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>About Us</li>
              <li>Contact</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Sports</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Football</li>
              <li>Cricket</li>
              <li>Basketball</li>
              <li>Tennis</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Follow Us</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Twitter</li>
              <li>Facebook</li>
              <li>Instagram</li>
              <li>YouTube</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Download App</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>iOS App</li>
              <li>Android App</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 Sports Analytics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 