import { homeCollectionNavbar } from "./homeCollectionNavbar.js";

export const participantSelection = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  displayKitStatusReportsHeader(auth, route);
};

export const displayKitStatusReportsHeader = () => {
    let template = ``;
    template += homeCollectionNavbar();
    template += renderKitStatusList();
    return template;
};

export const renderKitStatusList = () => {
    return `
        <div style="margin-top:10px; padding:15px 0 ;">
                <div>
                    <h5>Select a Kit Status</h5>
                    <label for="kitStatusSelection" class="col-form-label">Kit Status</label>
                    <select required class="col form-control kitStatusSelectionDropdown" id="kitStatusSelection">
                        <option id="select-dashboard" value="" >-- Select dashboard --</option>
                        <option id="select-pending" value="pending" >Pending</option>
                        <option id="select-assigned" value="assigned" >Assigned</option>
                        <option id="select-shipped" value="shipped">Shipped</option>
                        <option id="select-received" value="received">Received</option>
                    </select>
                </div>
                </br>
        </div>
    `;
};